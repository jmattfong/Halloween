import { CategoryLogger } from "typescript-logging";
import { getLogger } from "../../logging";

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

const log: CategoryLogger = getLogger("contact_sensor");

async function httpGet(url: string, headers: Record<string, string>): Promise<any> {
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: headers
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.text();
        log.debug(`Got API response ${data}`);
        return data;
    } catch (error) {
        log.error("Error fetching data:", error);
        throw error;
    }
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
