import { SpookyHueApi } from "./hue";
import { Pattern } from "./patterns";
import { getLogger } from '../logging'
import { CategoryLogger } from 'typescript-logging';

const log: CategoryLogger = getLogger("spooky-bulb-player")

export class SpookyHueBulbPlayer {
    private api: SpookyHueApi
    private currPatternMap: Map<number, Pattern>

    constructor(api: SpookyHueApi) {
        this.api = api;
        this.currPatternMap = new Map();
    }

    public async playPattern(lightId: number, patterns: Pattern[]) {
        if (!this.api.getIsConnected()) {
            throw new Error('not connected to the hue hub');
        }

        if (this.currPatternMap.has(lightId)) {
            log.info('interrupt current pattern');
            let bulb = this.currPatternMap.get(lightId);
            if (bulb) {
                bulb.cancel();
            }
        }

        log.info('playing light pattern');
        for (let i = 0; i < patterns.length; i++) {
            const pattern = patterns[i];
            log.info(`playing pattern: ${pattern.constructor.name}`);
            this.currPatternMap.set(lightId, pattern);
            const wasCancelled = await pattern.run(lightId, this.api);
            log.info('done playing pattern');
            if (wasCancelled) {
                return;
            }
        }

        this.currPatternMap.delete(lightId);
    }

    public async playRepeatingPattern(lightId: number, patterns: Pattern[]) {
        if (!this.api.getIsConnected()) {
            throw new Error('not connected to the hue hub');
        }

        const totalPatternLengthMs = patterns.map((p) => p.getDurationMs()).reduce((a, b) => a + b);
        log.info('playing repeated light pattern: ' + patterns);
        setInterval((() => { this.playPattern(lightId, patterns) }).bind(this), totalPatternLengthMs + 100);
    }
}
