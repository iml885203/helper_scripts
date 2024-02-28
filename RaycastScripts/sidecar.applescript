#!/usr/bin/osascript

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title SideCar
# @raycast.mode silent

# Optional parameters:
# @raycast.icon 💻

# Documentation: Toggle sidecar
# @raycast.author Logan

tell application "System Events"
	tell its application process "控制中心"
		tell its menu bar 1
			-- click on and open Control Center drop down
			tell (UI elements whose description is "控制中心")
				click
			end tell
		end tell
		-- interact with Control Center window
		tell its window "控制中心"
			delay 0.5
			-- click screen mirroring button
			set screenMirroringButton to button 2 of group 1
			-- click screenMirroringButton click doesn't work
			perform action 1 of screenMirroringButton
			delay 0.5
			set myScreen to checkbox 1 of its scroll area 1 of group 1
			perform action 1 of myScreen
		end tell
	end tell
end tell

