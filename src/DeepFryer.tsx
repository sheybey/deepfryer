import React from 'react';

import moduleFactory, {DeepFryModule} from 'deepfry-encoder/deepfry';
import ImagePicker from './ImagePicker';
import RangeInput from './RangeInput';

interface IRGBData {
  data: Uint8ClampedArray;
  width: number;
  height: number;
};

const DeepFryer: React.FC = () => {
  const [module, setModule] = React.useState<DeepFryModule>();
  const [loadError, setLoadError] = React.useState<string>();
  const [initialized, setInitialized] = React.useState(false);

  const [frying, setFrying] = React.useState(false);
  const [deepFryError, setDeepFryError] = React.useState<string>();
  const [blobUrl, setBlobUrl] = React.useState<string>();

  const defaultBrightness = 50;
  const [brightness, setBrightness] = React.useState(defaultBrightness);
  const defaultSaturation = 0.25;
  const [saturation, setSaturation] = React.useState(defaultSaturation);
  const defaultContrast = 128;
  const [contrast, setContrast] = React.useState(defaultContrast);


  React.useEffect(() => {
    let unmounted = false;
    moduleFactory({onRuntimeInitialized: () => {
      if (!unmounted) {
        setInitialized(true);
      }
    }}).then(setModule).catch((e) => setLoadError(e.toString()));
    return () => {
      unmounted = true;
    };
  }, []);


  React.useEffect(() => {
    if (blobUrl) {
      return () => URL.revokeObjectURL(blobUrl);
    }
  }, [blobUrl]);


  const onImagePicked = (imgPromise: Promise<ImageBitmap>) => {
    setFrying(true);
    imgPromise.then((bitmap) => {
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("failed to create canvas context");
      }

      try {
        ctx.drawImage(bitmap, 0, 0);
        return ctx.getImageData(0, 0, bitmap.width, bitmap.height);
      } catch (e) {
        throw new Error('unable to draw image: ' + e.toString());
      } finally {
        bitmap.close();
      }
    }).then((rgbaData): IRGBData => {
      const rgbData = new Uint8ClampedArray(rgbaData.data.length * (3/4));
      let r = 0;
      for (let i = 0; i < rgbaData.data.length; i += 4) {
        rgbData.set(rgbaData.data.subarray(i, i + 3), r);
        r += 3;
      }

      return {
        data: rgbData,
        width: rgbaData.width,
        height: rgbaData.height
      };
    }).then((rgbData) => {
      if (!module || !initialized) {
        throw new Error("jpeg compressor not initialized yet");
      }

      const buffer = module._malloc(rgbData.data.length);
      module.HEAPU8.set(rgbData.data, buffer);

      const outputPtr = module._malloc(4);
      const outputPtrPtr = module._malloc(4);
      const outputSize = module._malloc(4);
      const outputSizePtr = module._malloc(4);

      const errorPtrPtr = module._malloc(4);

      try {
        module.setValue(outputSizePtr, outputSize, "*");

        /*
        void adjust(unsigned char *input, unsigned long pixels,
            double saturation, int brightness, int contrast);
        */
        module._adjust(buffer, rgbData.data.length / 3,
          saturation, brightness, contrast);
        /*
        int compress(const unsigned char *input, int width, int height,
            unsigned char **output, unsigned long *output_size, char const **error);
        */
        const result = module._compress(buffer, rgbData.width, rgbData.height,
          outputPtrPtr, outputSizePtr, errorPtrPtr);

        if (result === 1) {
          // success
          const begin = module.getValue(outputPtrPtr, "*");
          const length = module.getValue(outputSizePtr, "i32");
          const jpegBlob = new Blob([module.HEAPU8.subarray(
            begin, begin + length)], {type: "image/jpeg"});
          module._tjFree(begin);

          setBlobUrl(URL.createObjectURL(jpegBlob));
          setDeepFryError(undefined);
        } else {
          const errorStr = module.UTF8ToString(module.getValue(errorPtrPtr, "*"));
          throw new Error(errorStr);
        }
      } finally {
        module._free(buffer);
        module._free(outputSizePtr);
        module._free(outputSize);
        module._free(outputPtr);
        module._free(errorPtrPtr);
      }

    }).catch((e) => {
      setDeepFryError(e.toString());
    }).finally(() => {
      setFrying(false);
    });
  };

  if (loadError) {
    return (<React.Fragment>
      <p>Error:</p>
      <pre>{loadError}</pre>
    </React.Fragment>);
  } else if (initialized) {
    return (<React.Fragment>
      <ImagePicker message={frying ? "Frying..." : "Upload an image to deep fry"}
        enabled={!frying} onImagePicked={onImagePicked}/>
      <p>
        <RangeInput min={-1} max={1} step={0.001} onSet={setSaturation}
          initial={defaultSaturation}>
          Saturation adjustment:
        </RangeInput>
      </p>
      <p>
        <RangeInput min={-128} max={128} onSet={setBrightness}
          initial={defaultBrightness}>
          Brightness adjustment:
        </RangeInput>
      </p>
      <p>
        <RangeInput min={-255} max={255} onSet={setContrast}
          initial={defaultContrast}>
          Contrast adjustment:
        </RangeInput>
      </p>
      {deepFryError && <p>Failed to deep fry: {deepFryError}</p>}
      {blobUrl && <React.Fragment>
        <p><img src={blobUrl} alt="deep-fried goodness"/></p>
        <p><a download="deepfried.jpg" href={blobUrl}>download</a></p>
      </React.Fragment>}
      <p>Made using <a href="https://github.com/mozilla/mozjpeg">mozjpeg</a>{' '}
        and <a href="https://emscripten.org">emscripten</a>.</p>
      <p><a href="https://github.com/sheybey/deepfryer">Source code</a></p>
    </React.Fragment>);
  } else {
    return (<p>Loading...</p>);
  }
};

export default DeepFryer;
