import React from 'react';

import ImagePicker from './ImagePicker';
import RangeInput from './RangeInput';


interface DeepFryMessage {
  data: ArrayBuffer;
  width: number;
  height: number;
  saturation: number;
  brightness: number;
  contrast: number;
};

interface DeepFryResponse {
  success: boolean,
  error?: string,
  jpeg?: ArrayBuffer
};

interface IRGBData {
  data: Uint8ClampedArray;
  width: number;
  height: number;
};

const DeepFryer: React.FC = () => {
  const [worker, ] = React.useState(() => new Worker('/static/js/deepfry.js'));
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
    if (blobUrl) {
      return () => URL.revokeObjectURL(blobUrl);
    }
  }, [blobUrl]);

  React.useEffect(() => {
    const handleMessage = (msg: MessageEvent) => {
      if (msg.data === 'initialized') {
        setInitialized(true);
      } else if ((typeof msg.data) === 'object') {
        let response = msg.data as DeepFryResponse;
        if (response.success && response.jpeg) {
          var blob = new Blob([response.jpeg], {type: 'image/jpeg'});
          setDeepFryError(undefined);
          setBlobUrl(URL.createObjectURL(blob));
        } else {
          setDeepFryError(response.error ?? "Unknown error");
        }
        setFrying(false);
      } else {
        setLoadError(msg.data.error?.toString() ?? "Unknown error");
      }
    }
    worker.addEventListener('message', handleMessage);

    return () => {
      worker.removeEventListener('message', handleMessage);
      worker.terminate();
    };
  }, [worker]);


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

      const msg: DeepFryMessage = {
        data: rgbData.data.buffer,
        width: rgbData.width,
        height: rgbData.height,
        saturation: saturation,
        brightness: brightness,
        contrast: contrast
      };
      worker.postMessage(msg, [rgbData.data.buffer]);
    }).catch((e) => {
      setDeepFryError(e.toString());
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
