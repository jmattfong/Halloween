#!/bin/bash
SERVICE="node"
if pgrep -x "$SERVICE" >/dev/null
then
    echo "$SERVICE is running"
else
    echo "$SERVICE stopped. Starting spookinator"
    nohup ts-node main.ts >~/spooky.log &
    echo "$SERVICE started in background"
    sleep 2

    PID=$(pgrep node)

    echo "PID of process is $PID"
    echo "to kill the process, run:"
    echo "kill -9 $PID"
    echo ""
    echo "to view logs, run the following command:"
    echo "tail -f ~/spooky.log"
fi