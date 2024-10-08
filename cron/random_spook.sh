#!/bin/bash

# a list of global scenes to send out
SCENES=("float" "alive" "sleep" "dead_people" "moan" "were_glob" "bustin_good")

TIMESTAMP=$(date)

echo "Running random spook @ $TIMESTAMP"

# pick a random item from the scenes array
SCENE=${SCENES[$RANDOM % ${#SCENES[@]} ]}

echo "Chose scene $SCENE"

# Generate a random delay between 0 and 5 minutes
DELAY=$((RANDOM % 300))

echo "Waiting $DELAY seconds"

# Wait for the random delay
sleep $DELAY

# Create a json payload with the scene and setting the scope to global
JSON="{\"scene\": \"$SCENE\", \"scope\": \"global\"}"

echo "Sending JSON payload $JSON"

/opt/homebrew/bin/http POST localhost:8008/trigger name="$SCENE" scope=global --ignore-stdin
