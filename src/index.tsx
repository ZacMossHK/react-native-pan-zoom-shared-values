import ImageContainerManipulator from "./ImageContainerManipulator";
import ImageContainerProvider from "./providers/ImageContainerProvider";
import { ImageContainerProps } from "./types";

const ImageContainer = ({
  imageSource,
  imageSrc,
  isUsingProvider,
}: ImageContainerProps) => {
  const Manipulator = () => {
    if (imageSrc) return <ImageContainerManipulator {...{ imageSrc }} />;
    return <ImageContainerManipulator {...{ imageSource }} />;
  };

  return isUsingProvider ? (
    <Manipulator />
  ) : (
    <ImageContainerProvider>
      <Manipulator />
    </ImageContainerProvider>
  );
};
export default ImageContainer;
