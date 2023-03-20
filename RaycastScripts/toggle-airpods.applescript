#!/usr/bin/osascript

# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Toggle Airpods
# @raycast.mode silent

# Optional parameters:
# @raycast.icon 🎧

# Documentation:
# @raycast.author Logan

use framework "IOBluetooth"
use scripting additions

set AirPodsName to "AirPods"

on getFirstMatchingDevice(deviceName)
	repeat with device in (current application's IOBluetoothDevice's pairedDevices() as list)
		if (device's nameOrAddress as string) contains deviceName then return device
	end repeat
end getFirstMatchingDevice

on toggleDevice(device)
	if not (device's isConnected as boolean) then
		device's openConnection()
		return "Connecting " & (device's nameOrAddress as string)
	else
		device's closeConnection()
		return "Disconnecting " & (device's nameOrAddress as string)
	end if
end toggleDevice

log toggleDevice(getFirstMatchingDevice(AirPodsName))

