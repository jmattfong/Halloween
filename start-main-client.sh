#!/bin/bash

ORCHESTRATOR_IP=${1:-"192.168.86.24"}
ORCHESTRATOR_PORT=${2:-8008}
PORT=${3:-8009}

echo "Starting client server MAIN on port $PORT with orchestrator http://${ORCHESTRATOR_IP}:${ORCHESTRATOR_PORT}"

./run-client -o $ORCHESTRATOR_IP -x $ORCHESTRATOR_PORT -p $PORT -s photobooth_spooks -s chromecast_portal_to_hell -s chromecast_ghosts
