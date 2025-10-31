import { CategoryLogger } from "typescript-logging";
import { getLogger } from "../../logging";

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

const log: CategoryLogger = getLogger("contact_sensor");

async function httpGet(url: string, headers: Record<string, string>): Promise<any> {
    const maxRetries = 5;
    let attempt = 0;
    let delay_ms = 500; // start with 1 second
    while (attempt < maxRetries) {
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: headers
            });
            if (response.status === 429) {
                log.warn(`Received 429 Too Many Requests. Retrying in ${delay_ms}ms (attempt ${attempt + 1}/${maxRetries})`);
                await new Promise(res => setTimeout(res, delay_ms));
                attempt++;
                delay_ms *= 2; // exponential backoff
                continue;
            }
            if (!response.ok) {
                log.warn(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.text();
            log.debug(`Got API response ${data}`);
            return data;
        } catch (error) {
            log.error("Error fetching data:", error);
        }
    }
    log.warn(`HTTP 429: Too Many Requests after ${maxRetries} retries.`);
}

export async function listContactSensors(hueBridgeIp: string, applicationKey: string): Promise<any> {
    let response = await httpGet(`https://${hueBridgeIp}/clip/v2/resource/contact`, {
        'hue-application-key': applicationKey,
    });
    return JSON.parse(response);
}

export async function getContactSensor(hueBridgeIp: string, applicationKey: string, sensorId: string): Promise<any> {
    let response = await httpGet(`https://${hueBridgeIp}/clip/v2/resource/contact/${sensorId}`, {
        'hue-application-key': applicationKey,
    });
    return JSON.parse(response);
}
