import {
  CSSProperties,
  DragEvent,
  FC,
  useState,
  useEffect,
} from 'react';


interface ImagePickerProps {
  message: string;
  enabled?: boolean;
  onImagePicked: (imageFile: File) => void;
}


const IMAGE_MIME = /^image\//;

const firstImageFromFileList = (files: FileList): File | undefined => {
    for (const file of files) {
    if (file.type.match(IMAGE_MIME)) {
      return file;
    }
  }
};

const firstImageFromDataTransfer = (transfer: DataTransfer): File | undefined => {
  for (const item of transfer.items) {
    if (item.kind === "file" && item.type.match(IMAGE_MIME)) {
      const file = item.getAsFile();
      if (file) {
        return file;
      }
    }
  }

  return firstImageFromFileList(transfer.files);
};

const ImagePicker: FC<ImagePickerProps> = ({message, enabled, onImagePicked}) => {
  const [validFile, setValidFile] = useState(false);
  if (enabled === undefined) {
    enabled = true;
  }

  const [fileInput, ] = useState(document.createElement('input'));

  useEffect(() => {
    fileInput.type = "file";
    fileInput.accept = "image/*";
    const onChange = () => {
      const file = fileInput.files && firstImageFromFileList(fileInput.files);
      if (file) {
        onImagePicked(file);
      }
    };
    fileInput.addEventListener("change", onChange);
    return () => fileInput.removeEventListener("change", onChange);
  }, [fileInput, enabled, onImagePicked]);

  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      if (event.clipboardData) {
        const file = firstImageFromDataTransfer(event.clipboardData);
        if (file) {
          onImagePicked(file);
        }
      }
    };

    document.addEventListener('paste', onPaste);
    return () => document.removeEventListener('paste', onPaste);
  }, [onImagePicked]);

  const onDragEnter = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const onDragOver = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (enabled && firstImageFromDataTransfer(event.dataTransfer)) {
      setValidFile(true);
    } else {
      setValidFile(false);
    }
  };

  const onDragLeave = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setValidFile(false);
  };

  const onDrop = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = firstImageFromDataTransfer(event.dataTransfer);
    setValidFile(false);
    if (enabled && file) {
      onImagePicked(file);
    }
  };

  const onClick = () => {
    fileInput.click();
  }

  const style: CSSProperties = {
    lineHeight: 5,
    border: '2px solid currentColor',
    color: validFile ? "black" : "gray",
    transform: "border-color,color 1s ease-in-out",
  };

  return <div onDragEnter={onDragEnter} onDragOver={onDragOver}
    onDragLeave={onDragLeave} onDrop={onDrop} onClick={onClick} style={style}
    title="Paste or drag and drop an image, or click/tap to pick one to upload">
    {message}</div>;
};

export default ImagePicker;
