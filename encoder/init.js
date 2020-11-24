(function(){
  moduleFactory().then((fryer) => {
    const fryImage = (msg) => {

      const rgbData = msg.data;
      rgbData.data = new Uint8Array(rgbData.data);

      const buffer = fryer._malloc(rgbData.data.length);
      fryer.HEAPU8.set(rgbData.data, buffer);

      const outputPtr = fryer._malloc(4);
      const outputPtrPtr = fryer._malloc(4);
      const outputSize = fryer._malloc(4);
      const outputSizePtr = fryer._malloc(4);

      const errorPtrPtr = fryer._malloc(4);

      try {
        fryer.setValue(outputSizePtr, outputSize, "*");

        /*
        void adjust(unsigned char *input, unsigned long pixels,
            double saturation, int brightness, int contrast);
        */
        fryer._adjust(buffer, rgbData.data.length / 3,
          rgbData.saturation, rgbData.brightness, rgbData.contrast);
        /*
        int compress(const unsigned char *input, int width, int height,
            unsigned char **output, unsigned long *output_size, char const **error);
        */
        const result = fryer._compress(buffer, rgbData.width, rgbData.height,
          outputPtrPtr, outputSizePtr, errorPtrPtr);

        if (result === 1) {
          // success
          const begin = fryer.getValue(outputPtrPtr, "*");
          const length = fryer.getValue(outputSizePtr, "i32");
          const jpegArray = new Uint8Array(length);
          jpegArray.set(fryer.HEAPU8.subarray(begin, begin + length))
          fryer._tjFree(begin);
          return jpegArray.buffer;
        } else {
          const errorStr = fryer.UTF8ToString(fryer.getValue(errorPtrPtr, "*"));
          throw new Error(errorStr);
        }
      } finally {
        fryer._free(buffer);
        fryer._free(outputSizePtr);
        fryer._free(outputSize);
        fryer._free(outputPtr);
        fryer._free(errorPtrPtr);
      }
    }

    self.addEventListener('message', (msg) => {
      new Promise((resolve, reject) => {
        try {
          resolve(fryImage(msg));
        } catch (err) {
          reject(err.toString());
        }
      })
        .then((buf) => self.postMessage({success: true, jpeg: buf}, [buf]))
        .catch((e) => self.postMessage({success: false, error: e}));
    });

    self.postMessage('initialized');
  }).catch((err) => {
    self.postMessage(err.toString());
  });
}());