/**
 * CIEColour is a crazy way to define colour that the HUE lightbulb seems to support
 * More info can be found [here](https://en.wikipedia.org/wiki/CIE_1931_color_space)
 */
export class CIEColour {
    private x: number
    private y: number

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