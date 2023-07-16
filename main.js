

const path = require("path")
const { BrowserWindow, app, desktopCapturer } = require('electron')



function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false
    }
  })
  win.webContents.openDevTools();
 
  win.webContents.setFrameRate(60)


  win.loadFile('index.html').then(()=>{
    desktopCapturer.getSources({ types: ['window', 'screen'] })
    .then(async sources => {

      for (const source of sources) {
      
        if (source.name === 'Tüm ekran') {
      
          win.webContents.send("SET_SOURCE",source.id)
          return
        }
      }
    })
  });





}

app.whenReady().then(() => {

  createWindow()

  



  app.on('activate', () => {

    if (BrowserWindow.getAllWindows().length === 0) {

      createWindow();
    }


  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})


