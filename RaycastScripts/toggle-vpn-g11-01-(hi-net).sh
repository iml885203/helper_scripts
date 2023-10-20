#!/bin/bash

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Toggle VPN G11-01 (Hi-Net)
# @raycast.mode silent

# Optional parameters:
# @raycast.icon 🌐

# Documentation:
# @raycast.author Logan

VPN_TARGET="G11-01 (Hi-Net)"
VPN_STATUS=$(tunnelblickctl status | grep "$VPN_TARGET" | awk '{print $3}')

if [ "$VPN_STATUS" = "CONNECTED" ]; then
    tunnelblickctl disconnect "$VPN_TARGET"
    echo "Disconnected from $VPN_TARGET"
elif [ "$VPN_STATUS" = "EXITING" ]; then
    echo "Connecting to $VPN_TARGET"
    tunnelblickctl connect "$VPN_TARGET"
else
    echo "⚠️ $VPN_TARGET is $VPN_STATUS"
fi
