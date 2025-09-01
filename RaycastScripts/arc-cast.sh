#!/bin/sh

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Cast
# @raycast.mode silent

# Optional parameters:
# @raycast.icon 🖥️

# Documentation: Need to add shotcut cmd + opt + t for cast on Arc browser
# @raycast.author Logan

# Activate Arc browser and simulate cmd + opt + t
osascript -e 'tell application "Arc" to activate' -e 'tell application "System Events" to keystroke "t" using {command down, option down}' 