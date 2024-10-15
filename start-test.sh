#!/bin/bash


SCENE=$1
ORCHESTRATOR_PORT=${2:-8008}
PORT=${3:-4242}
ORCHESTRATOR_IP=${2:-localhost}

echo "Starting client server TEST on port $PORT with orchestrator http://${ORCHESTRATOR_IP}:${ORCHESTRATOR_PORT}"

./run-client  -n test -o $ORCHESTRATOR_IP -x $ORCHESTRATOR_PORT -p $PORT -s $SCENE
