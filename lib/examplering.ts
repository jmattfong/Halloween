import 'dotenv/config'
import { RingApi, RingDeviceType } from 'ring-client-api'
import { skip } from 'rxjs/operators'

var userPass = require('/var/secret/ring-cred.json');
// Look at example here: https://github.com/dgreif/ring/blob/master/examples/example.ts
// And commit here if you need to add new functionality around new devices or locations
// https://github.com/jmattfong/Halloween/commit/65141d02f19ba41dfc8684a98d7a683c3a4e0850
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
    locations = await ringApi.getLocations(), // This gets all the locations under the ring account
    allCameras = await ringApi.getCameras(), // This gets all the cameras under the ring account
    devices = await locations[0].getDevices() //This gets the devices from the first location, in this case the house only has one location

  console.log(
    `Found ${locations.length} location(s) with ${allCameras.length} camera(s).`
  )

  // I've added these back in back in so that when you run the script at the start it will
  // spit out a bunch of useful logging information around location, all the devices in your account etc
  // This should make it a little easier to add new functionality
  for (const location of locations) {
    location.onConnected.pipe(skip(1)).subscribe(connected => {
      const status = connected ? 'Connected to' : 'Disconnected from'
      console.log(
        `**** ${status} location ${location.locationDetails.name} - ${location.locationId}`
      )
    })
  }

  for (const location of locations) {
    const cameras = location.cameras,
      devices = await location.getDevices()

    console.log(
      `\nLocation ${location.locationDetails.name} has the following ${cameras.length} camera(s):`
    )

    for (const camera of cameras) {
      console.log(`- ${camera.id}: ${camera.name} (${camera.deviceType})`)
    }

    console.log(
      `\nLocation ${location.locationDetails.name} has the following ${devices.length} device(s):`
    )

    for (const device of devices) {
      console.log(`- ${device.zid}: ${device.name} (${device.deviceType})`)
    }
  }

  // Right now this gets the contactSensor in the basement since the devices list only contains one
  // Once you add more you will have to find them with zid, or name etc
  const contactSensorBasement = devices.find(device => device.data.deviceType === RingDeviceType.ContactSensor)
  console.log(contactSensorBasement.data)

  // look at https://github.com/dgreif/ring/blob/master/api/ring-device.ts
  // to see what Subjects you can subscribe too.
  // Here is what you can subscribe to for Cameras: https://github.com/dgreif/ring/blob/master/api/ring-camera.ts
  // Again the examples folder has a lotta stuff you can do with subscribes here: https://github.com/dgreif/ring/tree/master/examples
  contactSensorBasement.onData.subscribe(() => {
    console.log('door moved')
    /*To only do actions on open or closed it probably is something like this
    *
    * if (contactSensorBasement.data.faulted == true) {
      console.log('door opened')
    } else {
      console.log('door closed')
    }
    *
    */
  })

  console.log('Listening for motion on contact sensor')
}

// All the above is a single function, when you run a typescript file
// it only executes functions that are called, in this case it calls example()
// which is the function we defined
example()