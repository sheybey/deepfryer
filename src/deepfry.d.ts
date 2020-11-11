/// <reference path="emscripten/index.d.ts" />

/*int deepfry(const unsigned char *input, int width, int pitch, int height,
int pixel_format, unsigned char **output, unsigned long *output_size,
char const **error);*/

export interface DeepFryModule extends EmscriptenModule {
  _deepfry: (inputPtr: number, width: number, pitch: number, height: number,
    pixelFormat: number, outputPtrPtr: number, outputSizePtr: number,
    errorPtrPtr: number) => 0|1;
  _tjFree: (ptr: number) => void;
  setValue: (ptr: number, value: any, type: Emscripten.CType, noSafe?: boolean) => void;
  getValue: (ptr: number, type: Emscripten.CType, noSafe?: boolean) => number;
  UTF8ToString: (ptr: number, maxBytesToRead?: number) => string;
}

declare const moduleFactory: EmscriptenModuleFactory<DeepFryModule>;
export default moduleFactory;
