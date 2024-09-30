import ImageContainerManipulator from "./ImageContainerManipulator";
import ImageContainerProvider from "./providers/ImageContainerProvider";
import { ImageContainerProps } from "./types";

const ImageContainer = ({
  imageSource,
  imageSrc,
  isUsingProvider,
}: ImageContainerProps) => {
  const Manipulator = () => {
    if (imageSource) return <ImageContainerManipulator {...{ imageSource }} />;
    return <ImageContainerManipulator {...{ imageSrc }} />;
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
