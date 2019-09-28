#!/usr/bin/env python

import sys
import json
from ring_doorbell import Ring
import time

def login(username, password) :
    ring = Ring('jmattfong@gmail.com', 'Ajmmwf<3!Ring')
    print('Connected: ' + str(ring.is_connected))
    return ring

def getFrontDoorbell(ring) :
    return ring.doorbells[0]

def getLatestEvent(doorbell) :
    doorbell.update()
    return doorbell.history(limit=1)[0]

def waitForNextEvent(doorbell, callback) :
    waitTimeSeconds = 2

    firstEvent = getLatestEvent(doorbell)
    latestEvent = firstEvent

    while (latestEvent['id'] == firstEvent['id']) :
        latestEvent = getLatestEvent(doorbell)
        if (latestEvent['id'] == firstEvent['id']) :
            print('No recent events found. Waiting %d seconds' % waitTimeSeconds)
            time.sleep(waitTimeSeconds)
        else :
            print('New event! %s' % str(latestEvent))

    callback(latestEvent['kind'])

def printResult(result) :
    print(str(result))



def main():
    passwordFile = sys.argv[1]
    creds = {}
    with open(passwordFile, 'r') as file:
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

if __name__== "__main__" :
    main()