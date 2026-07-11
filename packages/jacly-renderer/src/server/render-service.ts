import type {
  BrowserRenderPayload,
  RenderArtifact,
  RenderResponse,
  RenderSpec,
} from '../shared/types.js';
import type { ArtifactRenderer } from './browser-renderer.js';
import type { DiskRenderCache } from './cache.js';
import { renderHash } from './canonical-json.js';

export interface RenderServiceResult {
  response: Omit<RenderResponse, 'url' | 'markdown'>;
  artifact: RenderArtifact;
}

export class RenderService {
  private readonly inFlight = new Map<string, Promise<RenderArtifact>>();

  constructor(
    readonly cache: DiskRenderCache,
    private readonly renderer: ArtifactRenderer,
  ) {}

  async render(spec: RenderSpec): Promise<RenderServiceResult> {
    const hash = renderHash(spec);
    const cachedArtifact = await this.cache.get(hash, spec.format);
    if (cachedArtifact) {
      return {
        response: {
          hash,
          format: spec.format,
          width: cachedArtifact.width,
          height: cachedArtifact.height,
          cached: true,
        },
        artifact: cachedArtifact,
      };
    }

    let renderPromise = this.inFlight.get(hash);
    let joinedExistingRender = true;
    if (!renderPromise) {
      joinedExistingRender = false;
      const payload: BrowserRenderPayload = {
        workspace: spec.workspace,
        blockData: spec.blockData,
        options: spec.options,
      };
      renderPromise = this.renderer
        .render(payload, spec.format)
        .then(async (artifact) => {
          await this.cache.put(hash, spec.format, artifact);
          return artifact;
        })
        .finally(() => {
          this.inFlight.delete(hash);
        });
      this.inFlight.set(hash, renderPromise);
    }

    const artifact = await renderPromise;
    return {
      response: {
        hash,
        format: spec.format,
        width: artifact.width,
        height: artifact.height,
        cached: joinedExistingRender,
      },
      artifact,
    };
  }

  close(): Promise<void> {
    return this.renderer.close();
  }
}
