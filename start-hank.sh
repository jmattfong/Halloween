#!/bin/bash

ORCHESTRATOR_IP=${1:-"192.168.86.24"}
ORCHESTRATOR_PORT=${2:-8008}
PORT=${3:-4242}

echo "Starting client server HANK on port $PORT with orchestrator http://${ORCHESTRATOR_IP}:${ORCHESTRATOR_PORT}"

./run-client  -n hank -o $ORCHESTRATOR_IP -x $ORCHESTRATOR_PORT -p $PORT -s down_bath_random
