import 'dotenv/config'
import { RingApi, RingDeviceType } from 'ring-client-api'
import { skip } from 'rxjs/operators'

var userPass = require('/var/secret/ring-cred.json');

async function example() {
  const { env } = process,
    ringApi = new RingApi({
      // Replace with your ring email/password
      // without 2fa
      email: userPass.username,
      password: userPass.password,
      // Listen for dings and motion events
      cameraDingsPollingSeconds: 2
    }),
    locations = await ringApi.getLocations(),
    allCameras = await ringApi.getCameras(),
    devices = await locations[0].getDevices()
  console.log(
    `Found ${locations.length} location(s) with ${allCameras.length} camera(s).`
  )

  const contactSensor = devices.find(device => device.data.deviceType === RingDeviceType.ContactSensor)
  console.log(contactSensor.data)

  contactSensor.onData.subscribe(() => {
    console.log('door moved')
  })

  console.log('Listening for motion on contact sensor')
}

example()