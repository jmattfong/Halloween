import { readFileSync } from 'fs';

const v3 = require('node-hue-api').v3;
const LightState = v3.lightStates.LightState;

const secretContents = readFileSync('./secrets/secrets.json', {encoding: 'utf-8'})
let secrets = JSON.parse(secretContents);

const USERNAME = secrets.hueUsername
  // The name of the light we wish to retrieve by name
  , LIGHT_ID = 1
;


async function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

async function dothing() {
  v3.discovery.nupnpSearch()
    .then(searchResults => {
      const host = searchResults[0].ipaddress;
      return v3.api.createLocal(host).connect(USERNAME);
    })
    .then(doMoreShit)
}

async function doMoreShit(api) {
  var bright = 0;
  var stateTimeSwitch = new Date()
    while(true) {
    console.log('Setting state to ' + (bright * 100))
    // Using a LightState object to build the desired state
    const state = new LightState()
      .on()
      .ct(200)
      .on(bright * 100)
      .brightness(getRandomInt(100))
      .transitiontime(0)
    ;
    let attributesAndState = await api.lights.getLightAttributesAndState(LIGHT_ID);

    // MOTION SENSOR STUFF
    let motionSensor = await api.sensors.get(2);
    console.log(motionSensor["_stateAttributes"]["presence"]);
    console.log(motionSensor["_stateAttributes"]["lastupdated"]);

    if (motionSensor["_stateAttributes"]["presence"] == true){
      stateTimeSwitch = new Date(motionSensor["_stateAttributes"]["lastupdated"])

      api.lights.setLightState(LIGHT_ID, state);
    }
    bright = (bright + 1) % 2
    await sleep(getRandomInt(200)+50)
  }

;
}

dothing()