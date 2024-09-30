import { ImageSourcePropType } from "react-native";
import { SharedValue } from "react-native-reanimated";

export interface Coordinates {
  x: number;
  y: number;
}

export interface SizeDimensions {
  width: number;
  height: number;
}

export type TransformableMatrix3 = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number
];

interface ImageContainerManipulatorImageSrc {
  imageSrc: string | SharedValue<string>;
  imageSource?: never;
}
interface ImageContainerManipulatorImageSource {
  imageSrc?: never;
  imageSource: ImageSourcePropType | SharedValue<ImageSourcePropType>;
}

export type ImageContainerManipulatorProps =
  | ImageContainerManipulatorImageSrc
  | ImageContainerManipulatorImageSource;

export type ImageContainerProps = (
  | ImageContainerManipulatorImageSrc
  | ImageContainerManipulatorImageSource
) & { isUsingProvider?: boolean };
