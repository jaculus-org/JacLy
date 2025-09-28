// import * as tar from "tar-stream";
// import pako from "pako";
// import { Buffer } from "buffer";

// export async function extractPackageFromUri(pkgUri: string): Promise<tar.Extract> {
export async function extractPackageFromUri(pkgUri: string): Promise<void> {
  // const extract = tar.extract();

  // Fetch the package from the URI and convert to a readable stream
  const response = await fetch(pkgUri);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch package from ${pkgUri}: ${response.status} ${response.statusText}`
    );
  }

  if (!response.body) {
    throw new Error(`No response body received from ${pkgUri}`);
  }

  const reader = response.body.getReader();
  console.log('Stream created from fetch response' + reader);

  // await new Promise<void>((resolve, reject) => {
  //     const inflator = new pako.Inflate();

  //     inflator.onData = (chunk: Uint8Array) => {
  //         const u8 = chunk instanceof Uint8Array ? chunk : new Uint8Array(chunk);
  //         console.log(`Decompressed chunk of size: ${u8.length}`);
  //         // Here you can pipe the decompressed data to tar-stream
  //         extract.write(u8);
  //     };

  //     inflator.onEnd = (status: number) => {
  //         if (status !== 0) {
  //             reject(new Error("Failed to decompress package"));
  //             return;
  //         }
  //         console.log("Decompression finished.");
  //         extract.end();
  //         resolve();
  //     };

  //     async function pump() {
  //         try {
  //             while (true) {
  //                 const { done, value } = await reader.read();
  //                 if (done) {
  //                     inflator.push(new Uint8Array(0), true); // Signal end of data to pako
  //                     break;
  //                 }
  //                 if (value) {
  //                     inflator.push(value, false);
  //                 }
  //             }
  //         } catch (error) {
  //             reader.releaseLock();
  //             reject(error);
  //         }
  //     }

  //     pump();
  // });

  // return extract;
}
