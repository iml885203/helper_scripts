#!/usr/bin/osascript

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Cast
# @raycast.mode silent

# Optional parameters:
# @raycast.icon 🖥️

# Documentation:
# @raycast.author Logan

tell application "Arc"
	activate
	tell application "System Events" to keystroke "t" using {command down, option down}
end tell