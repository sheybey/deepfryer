/// <reference path="emscripten/index.d.ts" />

/*
int compress(const unsigned char *input, int width, int height,
    unsigned char **output, unsigned long *output_size, char const **error);

void adjust(unsigned char *input, unsigned long pixels,
    double saturation, int brightness, int contrast);
*/

export interface DeepFryModule extends EmscriptenModule {
  _compress: (inputPtr: number, width: number, height: number,
    outputPtrPtr: number, outputSizePtr: number, errorPtrPtr: number) => 0|1;
  _adjust: (inputPtr: number, pixels: number, saturation: number,
    brightness: number, contrast: number) => void;
  _tjFree: (ptr: number) => void;
  setValue: (ptr: number, value: any, type: Emscripten.CType, noSafe?: boolean) => void;
  getValue: (ptr: number, type: Emscripten.CType, noSafe?: boolean) => number;
  UTF8ToString: (ptr: number, maxBytesToRead?: number) => string;
}

declare const moduleFactory: EmscriptenModuleFactory<DeepFryModule>;
export default moduleFactory;
