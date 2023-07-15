#!/bin/bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Toggle VPN (LnB)
# @raycast.mode silent

# Optional parameters:
# @raycast.icon 🌱

# Documentation: Toggle connect VPN
# @raycast.author Logan

if [ $(/usr/sbin/networksetup -showpppoestatus LnB2) = 'disconnected' ]
then
    /usr/sbin/networksetup -connectpppoeservice LnB2
    echo "Connect VPN(LnB)"
else
    /usr/sbin/networksetup -disconnectpppoeservice LnB2
    echo "Disconnect VPN(LnB)"
fi