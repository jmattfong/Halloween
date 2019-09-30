import sys
import json
from ring_doorbell import Ring
import time
from pprint import pprint
from datetime import datetime, timedelta

class RingEnhancedSpookinator(object):

    def __init__(self, configPath):
        self.ring = self._setup(configPath)
        print('Ring setup. Connection status: ' + str(self.getStatus()))
        self.doorbell = self.ring.doorbells[0]
        self.last_alert = None
        print('Selected doorbell: ' + str(self.doorbell.name))
        super().__init__()

    def _setup(self, configPath):
        if not configPath:
            raise 'no ring config path passed'

        with open(configPath, 'r') as file:
            creds = json.loads(' '.join(file.readlines()))
        return Ring(creds['username'], creds['password'])

    def getStatus(self):
        return self.ring.is_connected

    def pollForActivity(self, callback):
        waitTimeSeconds = 2

        while True:
            result = self.doorbell.check_alerts()

            now = datetime.now()

            # check to see if the alert occurred, and if it has been greater than 30 seconds since the last
            # alert (dedupe that shit)
            if result == True and self.last_alert != None and ((now - self.last_alert) > timedelta(seconds=30)):
                print('alert detected! Calling callback')
                callback()
                self.last_alert = now

            time.sleep(waitTimeSeconds)
