import Animated, {
  useAnimatedStyle,
  useFrameCallback,
  useSharedValue,
} from "react-native-reanimated";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { Matrix3, identity3, multiply3 } from "react-native-redash";
import { Image } from "react-native";
import React, { useState } from "react";
import { Coordinates, SizeDimensions, TransformableMatrix3 } from "./types";
import {
  getMatrix,
  translateAndScaleMatrix,
  translateMatrix,
} from "./helpers/matrixHelpers";
import { imageContainerStyles } from "./styles";

// interface ImageContainerProps {
//   isViewRendered: SharedValue<boolean>;
//   translation: SharedValue<Coordinates>;
//   pinchScale: SharedValue<number>;
//   baseScale: SharedValue<number>;
//   transform: SharedValue<Matrix3>;
//   maxDistance: SharedValue<Coordinates>;
//   imageMatrix: SharedValue<Matrix3>;
//   origin: SharedValue<Coordinates>;
//   setNodes: React.Dispatch<React.SetStateAction<Nodes>>;
//   nodes: Nodes;
//   viewportMeasurements: SizeDimensions;
//   setViewportMeasurements: React.Dispatch<
//     React.SetStateAction<SizeDimensions | null>
//   >;
//   isAnimating: SharedValue<boolean>;
//   openBottomSheetHeight: SharedValue<number>;
//   openBottomSheetScaleDownPositionAdjustmentY: SharedValue<number>;
//   hasHitTopEdge: SharedValue<boolean>;
//   imageHeight: number;
//   imageWidth: number;
//   isImageWiderThanView: boolean | null;
//   selectedNodeIndex: SharedValue<number | null>;
//   isPanning: SharedValue<boolean>;
//   selectedSubNodeIndex: SharedValue<number | null>;
//   selectedNodePosition: SharedValue<Coordinates | null>;
// }

const imageToAnimate =
  "https://tobyroberts.co.uk/wp-content/uploads/2023/03/toby_roberts_world_cup_medal-1000.jpg";

let dimensions = { width: 0, height: 0 };

Image.getSize(imageToAnimate, (width, height) => {
  dimensions.width = width;
  dimensions.height = height;
});

const ImageContainer = ({
  // translation,
  // pinchScale,
  // baseScale,
  // transform,
  // maxDistance,
  // imageMatrix,
  // origin,
  // setNodes,
  // nodes,
  // viewportMeasurements,
  // setViewportMeasurements,
  // isAnimating,
  // openBottomSheetHeight,
  // openBottomSheetScaleDownPositionAdjustmentY,
  // hasHitTopEdge,
  // imageHeight,
  // imageWidth,
  // isImageWiderThanView,
  // selectedNodeIndex,
  // isPanning,
  // selectedSubNodeIndex,
  // selectedNodePosition,
  // givenLongPress,
  // extraGestures,
  imageSrc,
  // children,
}) => {
  // original code from https://github.com/software-mansion/react-native-gesture-handler/issues/2138#issuecomment-1231634779
  const origin = useSharedValue<Coordinates>({ x: 0, y: 0 });
  const transform = useSharedValue(identity3);
  const pinchScale = useSharedValue(1);
  const baseScale = useSharedValue(1);
  const translation = useSharedValue<Coordinates>({ x: 0, y: 0 });
  const maxDistance = useSharedValue<Coordinates>({ x: 0, y: 0 });
  const adjustedTranslationX = useSharedValue(0);
  const adjustedTranslationY = useSharedValue(0);
  const adjustedScale = useSharedValue(0);
  const isPinching = useSharedValue(false);
  const isPanning = useSharedValue(false);
  const imageMatrix = useSharedValue(identity3);

  const [viewportMeasurements, setViewportMeasurements] =
    useState<SizeDimensions>({
      width: 0,
      height: 0,
    });

  const imageHeight = viewportMeasurements.height
    ? viewportMeasurements.width * (dimensions.height / dimensions.width)
    : 0;

  const imageWidth = viewportMeasurements.width
    ? viewportMeasurements.height * (dimensions.width / dimensions.height)
    : 0;

  const isImageWiderThanView =
    viewportMeasurements.width &&
    viewportMeasurements.height &&
    dimensions.width / dimensions.height >=
      viewportMeasurements.width / viewportMeasurements.height;

  useFrameCallback(() => {
    imageMatrix.value = getMatrix(
      {
        x: translation.value.x,
        y: translation.value.y,
      },
      origin.value,
      pinchScale.value,
      transform.value
    );
  });

  const pinch = Gesture.Pinch()
    .onStart((event) => {
      origin.value = {
        x: event.focalX - viewportMeasurements.width / 2,
        y: maxDistance.value.y
          ? event.focalY - viewportMeasurements.height / 2
          : 0,
      };
      isPinching.value = true;
    })
    .onChange((event) => {
      if (adjustedScale.value) adjustedScale.value *= event.scaleChange;

      if (maxDistance.value.y && !origin.value.y) {
        transform.value = multiply3(
          translateAndScaleMatrix(identity3, origin.value, pinchScale.value),
          transform.value
        );
        baseScale.value *= pinchScale.value;
        pinchScale.value = 1;
        origin.value.y = event.focalY - viewportMeasurements.height / 2;
        adjustedScale.value = 1;
      }

      if (!maxDistance.value.y && adjustedScale.value) {
        origin.value.y = 0;
      }

      const scaleChangeSinceStart = adjustedScale.value || event.scale;

      if (scaleChangeSinceStart * baseScale.value <= 1) {
        pinchScale.value = 1 / baseScale.value;
      } else if (scaleChangeSinceStart * baseScale.value >= 5) {
        pinchScale.value = 5 / baseScale.value;
      } else {
        pinchScale.value = scaleChangeSinceStart;
      }
    })
    .onEnd(() => {
      isPinching.value = false;
      transform.value = multiply3(
        translateAndScaleMatrix(identity3, origin.value, pinchScale.value),
        transform.value
      );
      baseScale.value *= pinchScale.value;
      pinchScale.value = 1;
      adjustedScale.value = 0;
    });

  const pan = Gesture.Pan()
    .averageTouches(true)
    .onStart(() => {
      isPanning.value = true;
    })
    .onChange((event) => {
      const scaledOriginalMatrix = getMatrix(
        { x: 0, y: 0 },
        origin.value,
        pinchScale.value,
        transform.value
      );

      const changeAmountY = event.changeY;

      // adjustedTranslationY.value is always 0 unless vertical translation is valid
      adjustedTranslationY.value = maxDistance.value.y
        ? adjustedTranslationY.value + changeAmountY
        : 0;

      const currentPosition = {
        x: scaledOriginalMatrix[2] + event.translationX,
        y: scaledOriginalMatrix[5] + adjustedTranslationY.value,
      };

      if (
        Math.abs(currentPosition.x) > maxDistance.value.x ||
        adjustedTranslationX.value
      ) {
        /* this prevents overpanning the image past the border, and immediately pans back once the direction is reversed
      working out overpanning took countless late nights to work out and I am extremely proud of this */
        const maxDistanceTranslationX =
          maxDistance.value.x * (currentPosition.x > 0 ? 1 : -1) -
          scaledOriginalMatrix[2];
        if (
          !adjustedTranslationX.value ||
          (adjustedTranslationX.value > maxDistanceTranslationX &&
            currentPosition.x > 0) ||
          (adjustedTranslationX.value < maxDistanceTranslationX &&
            currentPosition.x < 0)
        ) {
          // this sets adjustedTranslationX to the border if it overpans
          adjustedTranslationX.value = maxDistanceTranslationX;
        }
        adjustedTranslationX.value += event.changeX;
      }

      if (Math.abs(currentPosition.y) > maxDistance.value.y) {
        // this allows an overpanned image to immediately pan back vertically once the vertical direction is reverse away from the border
        adjustedTranslationY.value =
          maxDistance.value.y * (currentPosition.y > 0 ? 1 : -1) -
          scaledOriginalMatrix[5];
      }

      translation.value = {
        x: adjustedTranslationX.value || event.translationX,
        y: adjustedTranslationY.value,
      };
    })
    .onEnd(() => {
      transform.value = multiply3(
        translateMatrix(identity3, translation.value.x, translation.value.y),
        transform.value
      );
      translation.value = { x: 0, y: 0 };
      adjustedTranslationX.value = 0;
      adjustedTranslationY.value = 0;
      isPanning.value = false;
    });

  const animatedStyle = useAnimatedStyle(() => {
    if (
      !translation.value.x &&
      !translation.value.y &&
      pinchScale.value === 1
    ) {
      const newMatrix = [...transform.value] as TransformableMatrix3;

      if (Math.abs(transform.value[2]) > maxDistance.value.x) {
        // this resets the transform at the edge if trying to pan outside of the image's boundaries
        newMatrix[2] = maxDistance.value.x * (transform.value[2] > 0 ? 1 : -1);
      }
      if (transform.value[5] > maxDistance.value.y) {
        newMatrix[5] = maxDistance.value.y;
      }
      if (Math.abs(transform.value[5]) > maxDistance.value.y) {
        // this resets the transform at the edge if trying to pan outside of the image's boundaries
        newMatrix[5] = maxDistance.value.y * (transform.value[5] > 0 ? 1 : -1);
      }
      transform.value = newMatrix as unknown as Matrix3;
      return {}; // required to stop animatedStyle endlessly refreshing - possibly related to https://github.com/software-mansion/react-native-reanimated/issues/1767
    }

    if (isImageWiderThanView) {
      maxDistance.value = {
        x:
          (viewportMeasurements.width * imageMatrix.value[0] -
            viewportMeasurements.width) /
          2,
        y:
          // the max distance for y will be a negative number so needs .abs to turn it into a positive number
          Math.abs(
            Math.min(
              (viewportMeasurements.height -
                imageHeight * imageMatrix.value[0]) /
                2,
              0
            )
          ),
      };
    } else {
      // this is only necessary if the aspect ratio of the image is thinner than the width of the viewport
      maxDistance.value = {
        // the max distance for x will be a negative number so needs .abs to turn it into a positive number
        x: Math.abs(
          Math.min(
            (viewportMeasurements.width - imageWidth * imageMatrix.value[0]) /
              2,
            0
          )
        ),
        y:
          (viewportMeasurements.height * imageMatrix.value[0] -
            viewportMeasurements.height) /
          2,
      };
    }

    return {
      transform: [
        {
          translateX: Math.max(
            -maxDistance.value.x,
            Math.min(maxDistance.value.x, imageMatrix.value[2])
          ),
        },
        {
          translateY: Math.max(
            -maxDistance.value.y,
            Math.min(maxDistance.value.y, imageMatrix.value[5])
          ),
        },
        { scaleX: imageMatrix.value[0] },
        { scaleY: imageMatrix.value[4] },
      ],
    };
  });

  return (
    <GestureHandlerRootView>
      <GestureDetector
        gesture={Gesture.Simultaneous(
          // Only gestures that are defined should be used
          ...[pinch, pan].filter(Boolean)
        )}
      >
        <Animated.View
          onLayout={({ nativeEvent }) => {
            const { height, width } = nativeEvent.layout;
            setViewportMeasurements({ height, width });
          }}
          collapsable={false}
          style={imageContainerStyles.fullscreen}
        >
          <Animated.Image
            src={imageSrc}
            resizeMode={"contain"}
            style={[imageContainerStyles.fullscreen, animatedStyle]}
            fadeDuration={0}
          />
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};

export default ImageContainer;
