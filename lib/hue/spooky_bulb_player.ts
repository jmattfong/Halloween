import { SpookyHueApi } from "./hue";
import { LightPattern } from "./patterns";

export class SpookyHueBulbPlayer {
    private api: SpookyHueApi

    constructor(api: SpookyHueApi) {
        this.api = api;
    }

    public async playPattern(lightId: number, patterns: LightPattern[]) {
        if (!this.api.getIsConnected()) {
            throw new Error('not connected to the hue hub');
        }

        console.log('playing light pattern');
        for (let i = 0; i < patterns.length; i++) {
            const pattern = patterns[i];
            console.log(`playing pattern: ${pattern.constructor.name}`);
            await pattern.run(lightId, this.api);
            console.log('done playing pattern');
        }

        console.log('done playing all patterns. Setting light back to default state');
        // set light back to default state
    }
}
