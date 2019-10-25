import { SpookyHueApi } from "./hue";
import { LightPattern } from "./patterns";

export class SpookyHueBulbPlayer {
    private api: SpookyHueApi
    private currPatternMap: Map<number, LightPattern>

    constructor(api: SpookyHueApi) {
        this.api = api;
        this.currPatternMap = new Map();
    }

    public async playPattern(lightId: number, patterns: LightPattern[]) {
        if (!this.api.getIsConnected()) {
            throw new Error('not connected to the hue hub');
        }

        if (this.currPatternMap.has(lightId)) {
            console.log('interrupt current pattern');
            this.currPatternMap.get(lightId).cancel();
        }

        console.log('playing light pattern');
        for (let i = 0; i < patterns.length; i++) {
            const pattern = patterns[i];
            console.log(`playing pattern: ${pattern.constructor.name}`);
            this.currPatternMap.set(lightId, pattern);
            const wasCancelled = await pattern.run(lightId, this.api);
            console.log('done playing pattern');
            if (wasCancelled) {
                return;
            }
        }

        this.currPatternMap.delete(lightId);
        console.log('done playing all patterns. Setting light back to default state');
        // set light back to default state
    }
}
