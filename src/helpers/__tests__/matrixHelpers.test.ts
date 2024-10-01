import { identity3 } from "react-native-redash";
import {
  getMatrix,
  scaleMatrix,
  translateAndScaleMatrix,
  translateMatrix,
} from "../matrixHelpers";

describe("translateMatrix", () => {
  it("translates the image matrix", () => {
    expect(translateMatrix(identity3, 2, 4)).toEqual([
      1, 0, 2, 0, 1, 4, 0, 0, 1,
    ]);
  });

  it("translates multiple times", () => {
    const firstResult = translateMatrix(identity3, 2, 4);
    expect(translateMatrix(firstResult, 4, 6)).toEqual([
      1, 0, 6, 0, 1, 10, 0, 0, 1,
    ]);
  });
});

describe("scaleMatrix", () => {
  it("scales the image matrix", () => {
    expect(scaleMatrix(identity3, 2)).toEqual([2, 0, 0, 0, 2, 0, 0, 0, 1]);
  });

  it("scales multiple times", () => {
    const firstResult = scaleMatrix(identity3, 2);
    expect(scaleMatrix(firstResult, 4)).toEqual([8, 0, 0, 0, 8, 0, 0, 0, 1]);
  });
});

describe("translateAndSclaeMatrix", () => {
  it("translates and scales the image matrix", () => {
    expect(translateAndScaleMatrix(identity3, { x: 1, y: 1 }, 2)).toEqual([
      2, 0, -1, 0, 2, -1, 0, 0, 1,
    ]);
  });
});

describe("getMatrix", () => {
  it("gets the image matrix", () => {
    expect(getMatrix({ x: 2, y: 2 }, { x: 1, y: 1 }, 2, identity3)).toEqual([
      2, 0, 1, 0, 2, 1, 0, 0, 1,
    ]);
  });
});
