const { app, BrowserWindow } = require('electron');

function createWindow() {
 const win = new BrowserWindow({
  width: 550,
  height: 600,
  transparent: false,
  
  webPreferences: {
   nodeIntegration: true,
   contextIsolation: true
  }
 })
 win.loadFile('index.html')
}

app.whenReady().then(createWindow);