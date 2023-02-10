const electronInstaller = require('electron-winstaller');
(async () => {
try {
    await electronInstaller.createWindowsInstaller({
        appDirectory: './out/applaud-win32-x64',
        outputDirectory: './tmp/build/installer64',
        authors: 'moon',
        exe: 'applaud.exe'
    });
    console.log('It worked!');
}
catch (e) {
    console.log(`No dice: ${e.message}`);
}
})();