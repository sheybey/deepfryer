import { FC, useState, useEffect, useCallback } from 'react';

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

const DeepFryer: FC = () => {
  const [worker, ] = useState(() => new Worker('/static/js/deepfry.js'));
  const [loadError, setLoadError] = useState<string>();

  const [initialized, setInitialized] = useState(false);

  const [frying, setFrying] = useState(false);
  const [sourceFile, setSourceFile] = useState<File>();
  const [deepFryError, setDeepFryError] = useState<string>();
  const [blobUrl, setBlobUrl] = useState<string>();

  const defaultBrightness = 50;
  const [brightness, setBrightness] = useState(defaultBrightness);
  const defaultSaturation = 0.25;
  const [saturation, setSaturation] = useState(defaultSaturation);
  const defaultContrast = 128;
  const [contrast, setContrast] = useState(defaultContrast);

  const [refryTimer, setRefryTimer] = useState<ReturnType<typeof setTimeout>>();
  const [shouldRefry, setShouldRefry] = useState(false);

  useEffect(() => {
    if (blobUrl) {
      return () => URL.revokeObjectURL(blobUrl);
    }
  }, [blobUrl]);

  useEffect(() => {
    const handleMessage = (msg: MessageEvent) => {
      if (msg.data === 'initialized') {
        setInitialized(true);
      } else if ((typeof msg.data) === 'object') {
        const response = msg.data as DeepFryResponse;
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
    };
  }, [worker]);

  const fryImage = useCallback((imageFile: File) => {
    if (refryTimer) {
      clearTimeout(refryTimer);
      setRefryTimer(undefined);
    }
    setFrying(true);
    new Promise<HTMLImageElement>((resolve, reject) => {
      const img = document.createElement('img');
      img.addEventListener('load', () => resolve(img));
      img.addEventListener('error', () => reject("Failed to decode image"));
      img.src = URL.createObjectURL(imageFile);
    }).then((img) => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      try {
        if (!ctx) {
          throw new Error("failed to create canvas context");
        }

        ctx.drawImage(img, 0, 0);
        return ctx.getImageData(0, 0, canvas.width, canvas.height);
      } catch (e: any) {
        throw new Error('unable to draw image: ' + e.toString());
      } finally {
        URL.revokeObjectURL(img.src);
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
      if (!initialized) {
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
      setDeepFryError(e?.toString() || "Unknown error");
      setFrying(false);
    });
  }, [refryTimer, worker, brightness, contrast, saturation, initialized]);

  const setParameter = useCallback((dispatch: (v: number) => void) => (v: number) => {
    dispatch(v);
    if (refryTimer) {
      clearTimeout(refryTimer);
    }
    if (sourceFile) {
      setRefryTimer(setTimeout(() => {
        setRefryTimer(undefined);
        setShouldRefry(true);
      }, 500));
    }
  }, [refryTimer, sourceFile]);

  useEffect(() => {
    if (shouldRefry) {
      setShouldRefry(false);
      if (sourceFile && !frying) {
        fryImage(sourceFile);
      }
    }
  }, [shouldRefry, sourceFile, frying, fryImage]);

  const onImagePicked = (imageFile: File) => {
    setSourceFile(imageFile);
    fryImage(imageFile);
  };

  if (loadError) {
    return (<>
      <p>Error:</p>
      <pre>{loadError}</pre>
    </>);
  } else if (initialized) {
    return (<>
      <ImagePicker enabled={!frying} onImagePicked={onImagePicked}
        message={frying ? "Frying..." : "Paste or upload an image to deep fry"}/>
      <p>
        <RangeInput min={-1} max={1} step={0.001} onSet={setParameter(setSaturation)}
          initial={defaultSaturation}>
          Saturation adjustment:
        </RangeInput>
      </p>
      <p>
        <RangeInput min={-128} max={128} onSet={setParameter(setBrightness)}
          initial={defaultBrightness}>
          Brightness adjustment:
        </RangeInput>
      </p>
      <p>
        <RangeInput min={-255} max={255} onSet={setParameter(setContrast)}
          initial={defaultContrast}>
          Contrast adjustment:
        </RangeInput>
      </p>
      {deepFryError && <p>Failed to deep fry: {deepFryError}</p>}
      {blobUrl && <>
        <p><img src={blobUrl} alt="deep-fried goodness"/></p>
        <p><a download="deepfried.jpg" href={blobUrl}>download</a></p>
      </>}
      <p>Made using <a href="https://github.com/mozilla/mozjpeg">mozjpeg</a>{' '}
        and <a href="https://emscripten.org">emscripten</a>.</p>
      <p><a href="https://github.com/sheybey/deepfryer">Source code</a></p>
    </>);
  } else {
    return (<p>Loading...</p>);
  }
};

export default DeepFryer;
