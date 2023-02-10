@echo off
cmd /c "(help FOO > nul || exit 0) && where FOO > nul 2> nul"
node -v > nul 2> nul
IF %ERRORLEVEL% NEQ 0 (
    echo "You must install nodeJS and npm to run the server. You can download them from https://nodejs.org/en/download/ ."
) ELSE (
    npm install
    node index.js
)