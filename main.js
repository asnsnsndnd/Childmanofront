import { app, BrowserWindow, Menu } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'electron-updater';
const { autoUpdater } = pkg;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 1. የኔትወርክ ገደቦችን ለማለፍ (ከ app.whenReady በፊት መሆን አለበት)
app.commandLine.appendSwitch('no-proxy-server'); // ፕሮክሲ እንዳይከለክለው
app.commandLine.appendSwitch('ignore-certificate-errors'); // HTTP ስህተቶችን እንዲያልፍ

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false, // ለ LAN ግንኙነት የግድ false መሆን አለበት
      allowRunningInsecureContent: true, // HTTP ከሌላ PC እንዲፈቀድ
    },
  });

  // 2. ለሙከራ ያህል በሌላኛው PC ላይ Inspect (Console) እንዲከፈት እናድርግ
  // ችግሩን ከፈታህ በኋላ ይህን መስመር ማጥፋት ትችላለህ
  win.webContents.openDevTools();

  Menu.setApplicationMenu(null);

  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:5173');
  } else {
    win.loadFile(path.join(__dirname, 'dist/index.html'));
  }

  if (app.isPackaged) {
    autoUpdater.checkForUpdatesAndNotify();
  }
}

// 3. አፑን ስንጀምር ፕሮክሲን ዝለል እንበለው
app.whenReady().then(() => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});