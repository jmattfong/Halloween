import sys
import json
from ring_doorbell import Ring
import time
from pprint import pprint

def login(username, password) :
    ring = Ring(username, password)
    print('Connected: ' + str(ring.is_connected))
    return ring

def getFrontDoorbell(ring) :
    return ring.doorbells[0]

def waitForNextEvent(doorbell, callback) :
    waitTimeSeconds = 2

    result = doorbell.check_alerts()
    callback(result)

    if doorbell.alert != None:
        # pprint(vars(doorbell))
        print('there was an alert!')
        print('it expires @ ' + str(doorbell.alert_expires_at))
    else:
        print('no alert found')

    time.sleep(waitTimeSeconds)

def printResult(result) :
    print(str(result))

def doRing(configPath):
    creds = {}
    with open(configPath, 'r') as file:
        creds = json.loads(' '.join(file.readlines()))

    ring = login(creds['username'], creds['password'])
    doorbell = getFrontDoorbell(ring)
    lastEvent = getLatestEvent(doorbell)
    print(str(lastEvent))
    print('--' * 50)
    print('Last Event:')
    print('--' * 50)
    print('ID:       %s' % lastEvent['id'])
    print('Kind:     %s' % lastEvent['kind'])
    print('Answered: %s' % lastEvent['answered'])
    print('When:     %s' % lastEvent['created_at'])
    print('--' * 50)

    while(True) :
        waitForNextEvent(doorbell, printResult)
        print('Keep waiting')

