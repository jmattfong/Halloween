#!/bin/bash

ORCHESTRATOR_IP=${1:-"192.168.86.24"}
ORCHESTRATOR_PORT=${2:-8008}
PORT=${3:-8009}

echo "Starting client server PHOTOBOOTH on port $PORT with orchestrator http://${ORCHESTRATOR_IP}:${ORCHESTRATOR_PORT}"

./run-client -n photobooth -o $ORCHESTRATOR_IP -x $ORCHESTRATOR_PORT -p $PORT -s chromecast_ghosts -s front_light_flicker
