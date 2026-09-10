// onnxruntime-node's published "types" path is missing, so declare the minimal
// surface we use (a single Node-only route: src/lib/cutout.ts).
declare module "onnxruntime-node" {
  export interface Tensor {
    readonly data: Float32Array | Uint8Array | Uint16Array;
    readonly dims: readonly number[];
  }
  export interface InferenceSession {
    run(feeds: Record<string, Tensor>): Promise<Record<string, Tensor>>;
    readonly inputNames: readonly string[];
    readonly outputNames: readonly string[];
  }
  interface Ort {
    Tensor: new (type: string, data: Float32Array | Uint8Array, dims: number[]) => Tensor;
    InferenceSession: { create(model: string | Uint8Array): Promise<InferenceSession> };
  }
  const ort: Ort;
  export default ort;
}
