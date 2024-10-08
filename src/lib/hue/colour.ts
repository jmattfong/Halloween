/**
 * CIEColour is a crazy way to define colour that the HUE lightbulb seems to support
 * More info can be found [here](https://en.wikipedia.org/wiki/CIE_1931_color_space)
 */
export class CIEColour {
  private x: number;
  private y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public getX() {
    return this.x;
  }

  public getY() {
    return this.y;
  }
}

export const red = new CIEColour(0.7, 0.3);
export const white = new CIEColour(0.31, 0.32);
export const blueish_white = new CIEColour(0.25, 0.35);
export const green = new CIEColour(0.3, 0.6);
export const blue = new CIEColour(0.2, 0.2);
export const orange = new CIEColour(0.5, 0.45);
