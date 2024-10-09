# react-native-pan-zoom-shared-values
#### A pan and zoom gesture control package for React Native that allows a user to access shared values from the pan and zoom animation using a provider.

## Installation
This package must be installed as a component in your file system. A future update will allow this package to be installed through npm.

#### 1. Git clone the package into your components folder:
```
cd components
git clone https://github.com/ZacMossHK/react-native-pan-zoom-shared-values.git
```
#### 2. Install the dependencies
```
cd components/react-native-pan-zoom-shared-values
npm i
```
There may be some problems using Reanimated and Gesture Handler if they are also used elsewhere in the app. If an error is thrown, remove Reanimated and Gesture Handler from the dependencies in react-native-pan-zoom-shared-values `package.json`. The dependencies must be installed in the module's directory for tests.

If installing Reanimated and Gesture Handler in the app's base node modules, this package requires Reanimated `3.x` and Gesture Handler `2.x`.

## Usage
```js
const App = () => {
  const imageSrc = "example-image.jpg"
  return <ImageContainer imageSrc={imageSrc} />
}
```
**EITHER imageSrc or imageSource are required, when given both the package will default to imageSrc.**
| Props | Type | Description | DefaultValue |
| --- | --- | --- | --- |
| **imageSrc (required)** | string | A string representing the remote URL of the image. This prop has precedence over imageSource prop. [See React Native Image docs.](https://reactnative.dev/docs/image#src) |
| **imageSource (required)** | [imageSource](https://reactnative.dev/docs/image#imagesource) | The image source (either a remote URL or a local file resource). [See React Native Image docs.](https://reactnative.dev/docs/image#source) |
| **isUsingProvider** | boolean | If true, the internal provider is disabled, allowing use of the ImageContainerProvider and context (see usage). The package will not work if this is set to true and no provider is used. | false |

### Using the Provider
The provider allows access to shared values through the ImageContainer context which can be used either in JS functions or UI thread worklets.
```js
const Container = () => {
  const {
    origin,
    translation,
    baseScale,
    pinchScale,
    transform,
    imageMatrix,
    isPinching,
    isPanning,
  } = useImageContainer();

  // example usage
  useFrameCallback(() => {
    console.log(imageMatrix.value)
  })

  const imageSrc = "example-image.jpg"
  return <ImageContainer imageSrc={imageSrc} isUsingProvider />
}

const App = () => (
  <ImageContainerProvider>
    <Container />
  </ImageContainerProvider>
)
```
The following are all shared values and provide the current position, scale, and gesture information. They can be used in UI thread worklets to work with the values during animations and gestures. [See the Reanimated docs on shared values for more details.](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started)

| Value | Type | Description |
| --- | --- | --- |
| **origin** | SharedValue<{x: number, y: number}> | An object representing the focal point origin coordinates for pinch gestures. |
| **translation** | SharedValue<{x: number, y: number}> | An object representing the x and y translation of the image relative to its last position during pan gestures. |
| **baseScale** | SharedValue\<number> | The current scale before any pinch gesture, updated once the pinch gesture ends. |
| **pinchScale** | SharedValue\<number> | The change in scale during the current pinch gesture. The current scale during gestures is calculated as baseScale * pinchscale. |
| **transform** | SharedValue\<Matrix3> | An array representing the image matrix before animation, updated once a gesture ends. |
| **imageMatrix** | SharedValue\<Matrix3> | An array representing an image matrix of the current position and scale during animation. The values given here should be considered the definitive position and scale of the image. |
| **isPinching** | SharedValue\<boolean> | True when the pinch gesture is being used. |
| **isPanning** | SharedValue\<boolean> | True when the pan gesture is being used. |

### What is Matrix3?
Matrix3 is a type from the [Redash utility library](https://wcandillon.github.io/react-native-redash-v1-docs/readme), a 9 element array representing a 3D image matrix.
Only some of the values are used in the image animation:
```js
const {
  imageMatrix
} = useImageContainer();

useFrameCallback(() => {
  console.log("scale", imageMatrix.value[0]
  console.log("translateX", imageMatrix.value[2])
  console.log("translateY", imageMatrix.value[5])
})
```
This will work the same for `transform.value`.

## Running tests:
#### 1. Install dependencies in the subdirectory:
```
cd .../react-native-pan-zoom-shared-values
npm i
```
#### 2. To run tests using Jest:
```
npm test
```
Tests must be run in the subdirectory as they rely on the package's babel and jest configuration.

## Tech stack
- Typescript
- React Native
- React Native Reanimated and React Native Gesture Handler by [Software mansion](https://swmansion.com/) for animation and gesture control.
- React Native Redash

Extracted from the app Betabook by Zac Moss.
