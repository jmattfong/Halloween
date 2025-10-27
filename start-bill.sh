#!/bin/bash

ORCHESTRATOR_IP=${1:-"192.168.86.24"}
ORCHESTRATOR_PORT=${2:-8008}
PORT=${3:-4269}

echo "Starting client server BILL on port $PORT with orchestrator http://${ORCHESTRATOR_IP}:${ORCHESTRATOR_PORT}"

./run-client -n bill -o $ORCHESTRATOR_IP -x $ORCHESTRATOR_PORT -p $PORT -s calming_cockroaches
