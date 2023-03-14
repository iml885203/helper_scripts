#!/bin/bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Toggle VPN (25sprout)
# @raycast.mode silent

# Optional parameters:
# @raycast.icon 🌱

# Documentation: Toggle connect VPN
# @raycast.author Logan

if [ $(/usr/sbin/networksetup -showpppoestatus 25sprout) = 'disconnected' ]
then
    /usr/sbin/networksetup -connectpppoeservice 25sprout
    echo "Connect VPN(25sprout)"
else
    /usr/sbin/networksetup -disconnectpppoeservice 25sprout
    echo "Disconnect VPN(25sprout)"
fi