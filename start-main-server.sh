#!/bin/bash

PORT=${1:-8008}

echo "Starting main orchestration server on port $PORT"

./run-server -p $PORT -b
