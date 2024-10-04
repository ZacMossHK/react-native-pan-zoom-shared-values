import { render, cleanup, fireEvent } from "@testing-library/react-native";
import ImageContainer from "..";
import {
  getByGestureTestId,
  fireGestureHandler,
} from "react-native-gesture-handler/jest-utils";
import { PanGesture, State } from "react-native-gesture-handler";
import { PinchGesture } from "react-native-gesture-handler/src/handlers/gestures/pinchGesture";
import { getAnimatedStyle, setUpTests } from "react-native-reanimated";

const imageToAnimate =
  "https://tobyroberts.co.uk/wp-content/uploads/2023/03/toby_roberts_world_cup_medal-1000.jpg";

setUpTests();

beforeEach(() => {
  cleanup();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

const setUpImageContainerTests = () => {
  const { getByTestId } = render(<ImageContainer imageSrc={imageToAnimate} />);
  const animImage = getByTestId("animatedImage");
  fireEvent(animImage, "load", {
    nativeEvent: { source: { height: 400, width: 400 } },
  });
  fireEvent(getByTestId("animatedView"), "layout", {
    nativeEvent: { layout: { height: 400, width: 400 } },
  });
  return { getByTestId, animImage };
};

test("the pinch gesture zooms in and out", () => {
  const { animImage } = setUpImageContainerTests();
  fireGestureHandler<PinchGesture>(getByGestureTestId("pinch"), [
    {
      state: State.ACTIVE,
    },
    {
      scale: 5,
    },
  ]);
  jest.advanceTimersByTime(1000);
  expect(getAnimatedStyle(animImage).transform[2].scaleX).toBe(5);
  expect(getAnimatedStyle(animImage).transform[3].scaleY).toBe(5);
  fireGestureHandler<PinchGesture>(getByGestureTestId("pinch"), [
    { state: State.BEGAN },
    { focalY: 10 },
    {
      state: State.ACTIVE,
    },
    {
      scale: 0.2,
    },
  ]);
  expect(getAnimatedStyle(animImage).transform[2].scaleX).toBe(1);
  expect(getAnimatedStyle(animImage).transform[3].scaleY).toBe(1);
});

test("cannot zoom in more than the default scale value", () => {
  const { animImage } = setUpImageContainerTests();
  fireGestureHandler<PinchGesture>(getByGestureTestId("pinch"), [
    {
      state: State.ACTIVE,
    },
    {
      scale: 100,
    },
  ]);
  jest.advanceTimersByTime(1000);
  expect(getAnimatedStyle(animImage).transform[2].scaleX).toBe(5);
  expect(getAnimatedStyle(animImage).transform[3].scaleY).toBe(5);
});

test("cannot zoom out past a scale value of 1", () => {
  const { animImage } = setUpImageContainerTests();
  fireGestureHandler<PinchGesture>(getByGestureTestId("pinch"), [
    {
      state: State.ACTIVE,
    },
    {
      scale: -100,
    },
  ]);
  jest.advanceTimersByTime(1000);
  expect(getAnimatedStyle(animImage).transform[2].scaleX).toBe(1);
  expect(getAnimatedStyle(animImage).transform[3].scaleY).toBe(1);
});

test("cannot pan while the image is at its base scale value", () => {
  const { animImage } = setUpImageContainerTests();
  fireGestureHandler<PanGesture>(getByGestureTestId("pan"), [
    {
      state: State.ACTIVE,
    },
    {
      translationX: 100,
    },
  ]);
  jest.advanceTimersByTime(1000);
  expect(getAnimatedStyle(animImage).transform[0].translateX).toBe(0);
  expect(getAnimatedStyle(animImage).transform[1].translateY).toBe(0);

  fireGestureHandler<PanGesture>(getByGestureTestId("pan"), [
    {
      state: State.ACTIVE,
    },
    {
      translationX: -100,
    },
  ]);
  jest.advanceTimersByTime(1000);
  expect(getAnimatedStyle(animImage).transform[0].translateX).toBe(0);
  expect(getAnimatedStyle(animImage).transform[1].translateY).toBe(0);

  fireGestureHandler<PanGesture>(getByGestureTestId("pan"), [
    {
      state: State.ACTIVE,
    },
    {
      translationY: 100,
    },
  ]);
  jest.advanceTimersByTime(1000);
  expect(getAnimatedStyle(animImage).transform[0].translateX).toBe(0);
  expect(getAnimatedStyle(animImage).transform[1].translateY).toBe(0);
  fireGestureHandler<PanGesture>(getByGestureTestId("pan"), [
    {
      state: State.ACTIVE,
    },
    {
      translationY: -100,
    },
  ]);
  jest.advanceTimersByTime(1000);
  expect(getAnimatedStyle(animImage).transform[0].translateX).toBe(0);
  expect(getAnimatedStyle(animImage).transform[1].translateY).toBe(0);
});

test("the image can pan once it is zoomed in", () => {
  const { animImage } = setUpImageContainerTests();
  fireGestureHandler<PinchGesture>(getByGestureTestId("pinch"), [
    {
      state: State.ACTIVE,
    },
    {
      scale: 2,
    },
  ]);
  jest.advanceTimersByTime(1000);
  fireGestureHandler<PanGesture>(getByGestureTestId("pan"), [
    {
      state: State.ACTIVE,
    },
    {
      translationX: 100,
    },
  ]);
  jest.advanceTimersByTime(1000);
  expect(getAnimatedStyle(animImage).transform[0].translateX).toBe(100);
  expect(getAnimatedStyle(animImage).transform[1].translateY).toBe(0);
  fireGestureHandler<PanGesture>(getByGestureTestId("pan"), [
    {
      state: State.ACTIVE,
    },
    {
      translationX: 0,
      translationY: 100,
    },
  ]);
  jest.advanceTimersByTime(1000);
  expect(getAnimatedStyle(animImage).transform[0].translateX).toBe(100);
  expect(getAnimatedStyle(animImage).transform[1].translateY).toBe(100);
});

test("the image cannot pan beyond its borders", () => {
  const { animImage } = setUpImageContainerTests();
  fireGestureHandler<PinchGesture>(getByGestureTestId("pinch"), [
    {
      state: State.ACTIVE,
    },
    {
      scale: 2,
    },
  ]);
  jest.advanceTimersByTime(1000);
  fireGestureHandler<PanGesture>(getByGestureTestId("pan"), [
    {
      state: State.ACTIVE,
    },
    {
      translationX: 400,
    },
  ]);
  jest.advanceTimersByTime(1000);
  expect(getAnimatedStyle(animImage).transform[0].translateX).toBe(200);
  expect(getAnimatedStyle(animImage).transform[1].translateY).toBe(0);
  fireGestureHandler<PanGesture>(getByGestureTestId("pan"), [
    { state: State.BEGAN },
    { translationX: 0 },
    {
      state: State.ACTIVE,
    },
    {
      translationX: -400,
    },
  ]);
  jest.advanceTimersByTime(1000);
  expect(getAnimatedStyle(animImage).transform[0].translateX).toBe(-200);
  expect(getAnimatedStyle(animImage).transform[1].translateY).toBe(0);
  fireGestureHandler<PanGesture>(getByGestureTestId("pan"), [
    { state: State.BEGAN },
    { translationX: 0 },
    {
      state: State.ACTIVE,
    },
    {
      translationX: 0,
      translationY: 400,
    },
  ]);
  jest.advanceTimersByTime(1000);
  expect(getAnimatedStyle(animImage).transform[0].translateX).toBe(-200);
  expect(getAnimatedStyle(animImage).transform[1].translateY).toBe(200);
  fireGestureHandler<PanGesture>(getByGestureTestId("pan"), [
    { state: State.BEGAN },
    { translationX: 0 },
    {
      state: State.ACTIVE,
    },
    { translationX: 0, translationY: -400 },
  ]);
  jest.advanceTimersByTime(1000);
  expect(getAnimatedStyle(animImage).transform[0].translateX).toBe(-200);
  expect(getAnimatedStyle(animImage).transform[1].translateY).toBe(-200);
});

test("an image can be panned immediately back when its panned beyond its left border", () => {
  const { animImage } = setUpImageContainerTests();
  fireGestureHandler<PinchGesture>(getByGestureTestId("pinch"), [
    {
      state: State.ACTIVE,
    },
    {
      scale: 2,
    },
  ]);
  jest.advanceTimersByTime(1000);
  fireGestureHandler<PanGesture>(getByGestureTestId("pan"), [
    {
      state: State.ACTIVE,
    },
    {
      translationX: 800,
    },
    { translationX: 700 },
  ]);
  jest.advanceTimersByTime(1000);
  expect(getAnimatedStyle(animImage).transform[0].translateX).toBe(100);
  expect(getAnimatedStyle(animImage).transform[1].translateY).toBe(0);
});

test("an image can be panned immediately back when its panned beyond its right border", () => {
  const { animImage } = setUpImageContainerTests();
  fireGestureHandler<PinchGesture>(getByGestureTestId("pinch"), [
    {
      state: State.ACTIVE,
    },
    {
      scale: 2,
    },
  ]);
  jest.advanceTimersByTime(1000);
  fireGestureHandler<PanGesture>(getByGestureTestId("pan"), [
    {
      state: State.ACTIVE,
    },
    {
      translationX: -800,
    },
    { translationX: -700 },
  ]);
  jest.advanceTimersByTime(1000);
  expect(getAnimatedStyle(animImage).transform[0].translateX).toBe(-100);
  expect(getAnimatedStyle(animImage).transform[1].translateY).toBe(0);
});

test("an image can be panned immediately back when its panned beyond its upper border", () => {
  const { animImage } = setUpImageContainerTests();
  fireGestureHandler<PinchGesture>(getByGestureTestId("pinch"), [
    {
      state: State.ACTIVE,
    },
    {
      scale: 2,
    },
  ]);
  jest.advanceTimersByTime(1000);
  fireGestureHandler<PanGesture>(getByGestureTestId("pan"), [
    {
      state: State.ACTIVE,
    },
    {
      translationY: -800,
      translationX: 0,
    },
    { translationY: -700, translationX: 0 },
  ]);
  jest.advanceTimersByTime(1000);
  expect(getAnimatedStyle(animImage).transform[0].translateX).toBe(0);
  expect(getAnimatedStyle(animImage).transform[1].translateY).toBe(-100);
});

test("an image can be panned immediately back when its panned beyond its lower border", () => {
  const { animImage } = setUpImageContainerTests();
  fireGestureHandler<PinchGesture>(getByGestureTestId("pinch"), [
    {
      state: State.ACTIVE,
    },
    {
      scale: 2,
    },
  ]);
  jest.advanceTimersByTime(1000);
  fireGestureHandler<PanGesture>(getByGestureTestId("pan"), [
    {
      state: State.ACTIVE,
    },
    {
      translationY: 800,
      translationX: 0,
    },
    { translationY: 700, translationX: 0 },
  ]);
  jest.advanceTimersByTime(1000);
  expect(getAnimatedStyle(animImage).transform[0].translateX).toBe(0);
  expect(getAnimatedStyle(animImage).transform[1].translateY).toBe(100);
});

test("an image can be panned back and forth going over both horizontal borders", () => {
  const { animImage } = setUpImageContainerTests();
  fireGestureHandler<PinchGesture>(getByGestureTestId("pinch"), [
    {
      state: State.ACTIVE,
    },
    {
      scale: 2,
    },
  ]);
  jest.advanceTimersByTime(1000);
  fireGestureHandler<PanGesture>(getByGestureTestId("pan"), [
    {
      state: State.ACTIVE,
    },
    {
      translationY: 800,
      translationX: 0,
    },
    { translationY: -800, translationX: 0 },
    { translationY: -700, translationX: 0 },
  ]);
  jest.advanceTimersByTime(1000);
  expect(getAnimatedStyle(animImage).transform[0].translateX).toBe(0);
  expect(getAnimatedStyle(animImage).transform[1].translateY).toBe(-100);
});

test("an image can be panned back and forth going over both vertical borders", () => {
  const { animImage } = setUpImageContainerTests();
  fireGestureHandler<PinchGesture>(getByGestureTestId("pinch"), [
    {
      state: State.ACTIVE,
    },
    {
      scale: 2,
    },
  ]);
  jest.advanceTimersByTime(1000);
  fireGestureHandler<PanGesture>(getByGestureTestId("pan"), [
    {
      state: State.ACTIVE,
    },
    {
      translationX: 800,
    },
    { translationX: -800 },
    { translationX: -700 },
  ]);
  jest.advanceTimersByTime(1000);
  expect(getAnimatedStyle(animImage).transform[0].translateX).toBe(-100);
  expect(getAnimatedStyle(animImage).transform[1].translateY).toBe(0);
});
