#!/usr/bin/osascript

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Music - AnimePianoInstrumentals
# @raycast.mode silent

# Optional parameters:
# @raycast.icon 💻

# Documentation: Play music for working
# @raycast.author Logan

tell application "Music"
	# Set volume
	set sound volume to 100

	# Disable repeat
	if (song repeat = one) or (song repeat = all) then
		set song repeat to off
	end if

	# Enable shuffle
	if shuffle enabled = false then
		set shuffle enabled to true
	end if

	# Play playlist
	play playlist "Anime Piano Instrumentals"

	# Show message
	log "Play Working Music"
end tell
