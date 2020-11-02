# need use NoiseBuddy v1.2
# https://github.com/insidegui/NoiseBuddy/releases/tag/1.2
tell application "System Events" to tell process "NoiseBuddy"
	tell menu bar item 1 of menu bar 2
		click
	end tell
end tell

using terms from application "Spotify"
	if player state of application "Spotify" is paused then
		tell application "Spotify" to play
	else
		tell application "Spotify" to pause
	end if
end using terms from
