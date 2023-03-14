#!/usr/bin/osascript

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Music - Meeting BGM
# @raycast.mode silent

# Optional parameters:
# @raycast.icon 👥

# Documentation: Play music for meeting
# @raycast.author Logan

tell application "Music"
	# Play playlist
	play playlist "BGM"

	# Set volume
	set sound volume to 5

	# Enable repeat
	if (song repeat = off) or (song repeat = all) then
		set song repeat to one
	end if

	# Disable shuffle
	if shuffle enabled then
		set shuffle enabled to false
	end if

	# Show message
	log "Play Meeting Music"
end tell
