if application "Music" is running then
    tell application "Music" to play
end if
if application "Spotify" is running then
    tell application "Spotify" to play
end if

tell application "System Events"
	tell process "SystemUIServer"
		click (menu bar item 1 of menu bar 1 whose description contains "volume")
		click menu item "Your AirPods Pro Name" of menu 1 of result
		click menu item "降噪" of menu 1 of result
	end tell
end tell
