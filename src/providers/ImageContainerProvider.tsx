import { PropsWithChildren, createContext, useContext } from "react";
import {
  SharedValue,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";
import { Coordinates } from "../types";
import { identity3, Matrix3 } from "react-native-redash";
import { getMatrix } from "../helpers/matrixHelpers";

interface ImageContainerContextType {
  origin: SharedValue<Coordinates>;
  transform: SharedValue<Matrix3>;
  pinchScale: SharedValue<number>;
  baseScale: SharedValue<number>;
  translation: SharedValue<Coordinates>;
  isPinching: SharedValue<boolean>;
  isPanning: SharedValue<boolean>;
  imageMatrix: SharedValue<Matrix3>;
}

const ImageContainerContext = createContext<ImageContainerContextType>({
  origin: { value: { x: 0, y: 0 } } as SharedValue<Coordinates>,
  transform: { value: identity3 } as SharedValue<Matrix3>,
  pinchScale: { value: 1 } as SharedValue<number>,
  baseScale: { value: 1 } as SharedValue<number>,
  translation: { value: { x: 0, y: 0 } } as SharedValue<Coordinates>,
  isPinching: { value: false } as SharedValue<boolean>,
  isPanning: { value: false } as SharedValue<boolean>,
  imageMatrix: { value: identity3 } as SharedValue<Matrix3>,
});

const ImageContainerProvider = ({ children }: PropsWithChildren) => {
  const origin = useSharedValue<Coordinates>({ x: 0, y: 0 });
  const transform = useSharedValue(identity3);
  const pinchScale = useSharedValue(1);
  const baseScale = useSharedValue(1);
  const translation = useSharedValue<Coordinates>({ x: 0, y: 0 });
  const isPinching = useSharedValue(false);
  const isPanning = useSharedValue(false);
  const imageMatrix = useDerivedValue(() =>
    getMatrix(
      {
        x: translation.value.x,
        y: translation.value.y,
      },
      origin.value,
      pinchScale.value,
      transform.value
    )
  );

  return (
    <ImageContainerContext.Provider
      value={{
        origin,
        translation,
        transform,
        pinchScale,
        baseScale,
        isPinching,
        isPanning,
        imageMatrix,
      }}
    >
      {children}
    </ImageContainerContext.Provider>
  );
};

export default ImageContainerProvider;

export const useImageContainer = () => useContext(ImageContainerContext);
