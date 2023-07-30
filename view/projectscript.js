document.getElementById('findproject').addEventListener('click', () => {
    if (require) {
        let electron = require('electron');
        electron.ipcRenderer.send('loadFile', { ...localStorage });
        electron.ipcRenderer.once('loadedLS', (e, lc) => {
            localStorage.clear();
            for (let k in lc) {
                localStorage.setItem(k, lc[k]);
            }
            location.href="workspace/index.html";
        });
    }
});