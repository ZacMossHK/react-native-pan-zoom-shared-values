import { render, cleanup } from "@testing-library/react-native";
import ImageContainer from "..";
import {
  getByGestureTestId,
  fireGestureHandler,
} from "react-native-gesture-handler/jest-utils";
import { State } from "react-native-gesture-handler";
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

test("zooming in and out", () => {
  const { getByTestId } = render(<ImageContainer imageSrc={imageToAnimate} />);
  const animImage = getByTestId("animatedImage");
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
    {
      state: State.ACTIVE,
    },
    {
      scale: -5,
    },
  ]);
  expect(getAnimatedStyle(animImage).transform[2].scaleX).toBe(1);
  expect(getAnimatedStyle(animImage).transform[3].scaleY).toBe(1);
});

test("cannot zoom more than the default scale value", () => {
  const { getByTestId } = render(<ImageContainer imageSrc={imageToAnimate} />);
  const animImage = getByTestId("animatedImage");
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
