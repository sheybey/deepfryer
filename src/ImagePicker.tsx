import React from 'react';


interface ImagePickerProps {
  message: string;
  enabled?: boolean;
  onImagePicked: (imgPromise: Promise<ImageBitmap>) => void;
}

const ImagePicker: React.FC<ImagePickerProps> = ({message, enabled, onImagePicked}) => {
  const [validFile, setValidFile] = React.useState(false);
  if (enabled === undefined) {
    enabled = true;
  }

  const [fileInput, ] = React.useState(document.createElement('input'));

  const loadBlob = React.useCallback((file: Blob) => {
    onImagePicked(createImageBitmap(file));
    fileInput.value = '';
  }, [onImagePicked, fileInput]);

  React.useEffect(() => {
    fileInput.type = "file";
    fileInput.accept = "image/*";
    const onChange = () => {
      if (fileInput.files && fileInput.files.length > 0) {
        loadBlob(fileInput.files[0]);
      }
    };
    fileInput.addEventListener("change", onChange);
    return () => fileInput.removeEventListener("change", onChange);
  }, [fileInput, loadBlob]);

  const dragHasImageFile = (event: React.DragEvent<HTMLElement>): DataTransferItem | undefined => {
    let items = event.dataTransfer.items;
    if (items.length > 0 && items[0].kind === "file" && items[0].type.match(/^image\//)) {
      return items[0];
    }
  }

  const dropHasImageFile = (event: React.DragEvent<HTMLElement>): Blob | undefined => {
    let files = event.dataTransfer.files;
    if (files && files.length > 0) {
      if (files[0].type.match(/^image\//)) {
        return files[0];
      }
    }
  }

  const onDragEnter = (event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
  }

  const onDragOver = (event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (enabled && dragHasImageFile(event)) {
      setValidFile(true);
    } else {
      setValidFile(false);
    }
  };

  const onDragLeave = (event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setValidFile(false);
  };

  const onDrop = (event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    let file = dropHasImageFile(event);
    setValidFile(false);
    if (enabled && file) {
      loadBlob(file);
    }
  };

  const onClick = (event: React.MouseEvent<HTMLElement>) => {
    fileInput.click();
  }

  const style: React.CSSProperties = {
    lineHeight: 5,
    border: '2px solid currentColor',
    color: validFile ? "black" : "gray",
    transform: "border-color,color 1s ease-in-out",
  };

  return <div onDragEnter={onDragEnter} onDragOver={onDragOver}
    onDragLeave={onDragLeave} onDrop={onDrop} onClick={onClick} style={style}
    title="Drag and drop an image, or click/tap to pick one to upload">
    {message}</div>;
};

export default ImagePicker;
