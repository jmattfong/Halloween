#!/bin/bash

# a list of global scenes to send out
SCENES=("attic_lurk" "attic_ruckus" "attic_attack")

TIMESTAMP=$(date)

echo "Running random spook @ $TIMESTAMP"

# pick a random item from the scenes array
SCENE=${SCENES[$RANDOM % ${#SCENES[@]} ]}

echo "Chose scene $SCENE"

# Generate a random delay between 4 and 10 minutes (240-600 seconds)
# Use RANDOM modulo the inclusive range length (600 - 240 = 360, +1 => 361)
DELAY=$(((RANDOM % 360) + 240))

echo "Waiting $DELAY seconds"

# Wait for the random delay
sleep $DELAY

# Create a json payload with the scene and setting the scope to global
JSON="{\"scene\": \"$SCENE\", \"scope\": \"direct\", \"name\": \"hank\"}"

echo "Sending JSON payload $JSON"

/opt/homebrew/bin/http POST localhost:8008/trigger name="$SCENE" scope=direct clientEndpoint="http://192.168.0.124:4242" --ignore-stdin
