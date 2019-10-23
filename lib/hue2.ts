import { readFileSync } from 'fs';

const v3 = require('node-hue-api').v3;
const LightState = v3.lightStates.LightState;

const secretContents = readFileSync('./secrets/secrets.json', {encoding: 'utf-8'})
let secrets = JSON.parse(secretContents);

const USERNAME = secrets.hueUsername
  // The name of the light we wish to retrieve by name
  , LIGHT_ID = 3
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

    console.log(attributesAndState["state"]["on"])
        if (attributesAndState["state"]["on"] == false) {
          // await sleep(300)
        }

      // .then(attributesAndState => {
      //   // Display the details of the light
      //   // console.log(JSON.stringify(attributesAndState, null, 2));

    // });
     bright = (bright + 1) % 2
     api.lights.setLightState(LIGHT_ID, state);
     api.lights.setLightState(2, state);
     await sleep(getRandomInt(200)+50)
  }
}

dothing()