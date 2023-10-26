#!/bin/bash

ORCHESTRATOR_IP=${1:-"192.168.86.24"}
ORCHESTRATOR_PORT=${2:-8008}
PORT=${3:-6969}

echo "Starting client server BOOMHAUER on port $PORT with orchestrator http://${ORCHESTRATOR_IP}:${ORCHESTRATOR_PORT}"

./run-client  -n boomhauer -o $ORCHESTRATOR_IP -x $ORCHESTRATOR_PORT -p $PORT -s scream -s black_light_hallway
