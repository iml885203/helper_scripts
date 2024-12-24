#!/usr/bin/env node

// Required parameters:
// @raycast.schemaVersion 1
// @raycast.title Run Command in iTerm
// @raycast.mode silent
// @raycast.packageName Terminal

// Optional parameters:
// @raycast.icon 🔥
// @raycast.argument1 { "type": "text", "placeholder": "Command to run" }
// @raycast.shortcut cmd shift c

const { exec } = require('child_process');

const command = process.argv[2];

// Escape double quotes and backslashes in the command
const escapedCommand = command.replace(/["\\]/g, '\\$&');

const script = `
tell application "iTerm2"
    -- Create a new window or use existing one
    if not (exists window 1) then
        create window with default profile
    end if
    
    tell current window
        -- Create a new tab
        create tab with default profile
        -- Write the command in the new tab
        tell current session
            write text "${escapedCommand}"
        end tell
    end tell
    
    activate
end tell
`;

// Execute the AppleScript
exec(`osascript -e '${script}'`, (error, stdout, stderr) => {
    if (error) {
        console.error(`Error: ${error}`);
        return;
    }
    if (stderr) {
        console.error(`stderr: ${stderr}`);
        return;
    }
});
