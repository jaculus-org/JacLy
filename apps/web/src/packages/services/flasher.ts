import { ESPLoader, type IEspLoaderTerminal } from 'esptool-js';
import pako from 'pako';
import { Archive } from '@obsidize/tar-browserify';
import { type Manifest, parseManifest } from '@jaculus/firmware/manifest';

export interface FlashProgress {
  stage: 'downloading' | 'extracting' | 'flashing';
  fileIndex: number;
  totalFiles: number;
  fileName: string;
  written: number;
  total: number;
  percentage: number;
}

/**
 * ESP32 Firmware Flasher
 * Downloads, extracts, and flashes firmware to ESP32 family devices
 */
export class ESP32Flasher {
  private esploader: ESPLoader | null = null;
  private terminal: IEspLoaderTerminal;
  private onProgress?: (progress: FlashProgress) => void;

  constructor(
    terminal: IEspLoaderTerminal,
    onProgress?: (progress: FlashProgress) => void
  ) {
    this.terminal = terminal;
    this.onProgress = onProgress;
  }

  /**
   * Download and extract firmware package
   */
  private async downloadAndExtract(
    url: string
  ): Promise<{ manifest: Manifest; files: Record<string, Uint8Array> }> {
    this.terminal.writeLine(`Downloading firmware from ${url}...`);

    this.onProgress?.({
      stage: 'downloading',
      fileIndex: 0,
      totalFiles: 0,
      fileName: 'firmware.tar.gz',
      written: 0,
      total: 0,
      percentage: 0,
    });

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download firmware: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    this.terminal.writeLine(
      `Downloaded ${(arrayBuffer.byteLength / 1024 / 1024).toFixed(2)} MB`
    );

    this.onProgress?.({
      stage: 'extracting',
      fileIndex: 0,
      totalFiles: 0,
      fileName: '',
      written: 0,
      total: 0,
      percentage: 0,
    });

    this.terminal.writeLine('Decompressing...');
    const decompressed = pako.ungzip(new Uint8Array(arrayBuffer));

    this.terminal.writeLine('Extracting files...');

    const files: Record<string, Uint8Array> = {};
    let manifest: Manifest | null = null;

    for await (const entry of Archive.read(decompressed)) {
      if (entry.fileName === 'manifest.json') {
        const manifestText = new TextDecoder().decode(entry.content!);
        manifest = parseManifest(manifestText);
      } else if (entry.isFile()) {
        files[entry.fileName] = entry.content!;
      }
    }

    if (!manifest) {
      throw new Error('No manifest.json found in package');
    }

    this.terminal.writeLine(
      `Found manifest: ${manifest.board} ${manifest.version}`
    );

    if (manifest.platform !== 'esp32') {
      throw new Error(`Unsupported platform: ${manifest.platform}`);
    }

    this.terminal.writeLine(`Extracted ${Object.keys(files).length} files`);
    return { manifest, files };
  }

  /**
   * Setup flasher with an already-initialized ESPLoader instance
   */
  async setup(esploader: ESPLoader): Promise<void> {
    this.esploader = esploader;
    this.terminal.writeLine(
      `Using ESPLoader for chip: ${this.esploader.chip.CHIP_NAME}`
    );
  }

  /**
   * Flash firmware to the device
   */
  async flash(firmwareUrl: string, noErase: boolean = false): Promise<void> {
    if (!this.esploader) {
      throw new Error('ESPLoader not initialized. Call setup() first.');
    }

    this.terminal.clean();
    this.terminal.writeLine('=== ESP32 Firmware Flasher ===\n');

    // Download and extract firmware
    const { manifest, files } = await this.downloadAndExtract(firmwareUrl);

    // Verify chip type
    const detectedChip = this.esploader.chip.CHIP_NAME;
    const expectedChip = manifest.config.chip;

    if (detectedChip !== expectedChip) {
      throw new Error(
        `Chip mismatch! Expected ${expectedChip}, but detected ${detectedChip}`
      );
    }

    // Prepare files for flashing
    const fileArray: { data: string; address: number; fileName: string }[] = [];
    const partitions = manifest.config.partitions;

    for (const partition of partitions) {
      // Skip storage partitions if noErase is enabled
      if (partition.isStorage && noErase) {
        this.terminal.writeLine(
          `Skipping ${partition.name} (storage partition, data preserved)`
        );
        continue;
      }

      const fileData = files[partition.file];
      if (!fileData) {
        throw new Error(`File not found: ${partition.file}`);
      }

      const address = parseInt(partition.address);
      fileArray.push({
        data: this.esploader.ui8ToBstr(fileData),
        address,
        fileName: partition.file,
      });

      this.terminal.writeLine(
        `Prepared ${partition.file} (${fileData.length} bytes)`
      );
    }

    // Flash the firmware
    this.terminal.writeLine('\n=== Flashing firmware ===\n');

    this.onProgress?.({
      stage: 'flashing',
      fileIndex: 0,
      totalFiles: fileArray.length,
      fileName: fileArray[0]?.fileName || '',
      written: 0,
      total: fileArray[0]?.data.length || 0,
      percentage: 0,
    });

    await this.esploader.writeFlash({
      fileArray,
      flashSize: '4MB',
      flashMode: 'keep',
      flashFreq: 'keep',
      eraseAll: false,
      compress: true,
      reportProgress: (fileIndex: number, written: number) => {
        const file = fileArray[fileIndex];
        const percentage = (written / file.data.length) * 100;

        this.onProgress?.({
          stage: 'flashing',
          fileIndex,
          totalFiles: fileArray.length,
          fileName: file.fileName,
          written,
          total: file.data.length,
          percentage,
        });
      },
    });

    this.terminal.writeLine('\n=== Flashing complete! ===');
  }

  /**
   * Disconnect from the device
   */
  async disconnect(): Promise<void> {
    if (this.esploader) {
      try {
        await this.esploader.transport.disconnect();
      } catch {
        // Ignore reset errors during disconnect
      }
      this.esploader = null;
    }
  }
}
