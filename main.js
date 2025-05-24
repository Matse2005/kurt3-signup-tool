const { app, BrowserWindow, ipcMain, session, Menu } = require("electron");
const path = require("path");

let selectedDate = null;
let waitingToIntercept = true;
let win = null;

function getFormattedDate() {
  return selectedDate || "None";
}

function createWindow() {
  win = new BrowserWindow({
    width: 1300,
    height: 900,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
    icon: __dirname + "/build/icon.png",
  });

  win.loadFile("index.html");
  setupMenu();

  session.defaultSession.webRequest.onBeforeRequest(
    { urls: ["*://kurt3.ghum.kuleuven.be/api/resourcetypeavailabilities*"] },
    (details, callback) => {
      if (selectedDate && waitingToIntercept) {
        try {
          const url = new URL(details.url);
          url.searchParams.set("startDate", selectedDate);
          url.searchParams.set("endDate", selectedDate);

          console.log("✅ Injected date into request:", selectedDate);
          waitingToIntercept = false;
          callback({ redirectURL: url.toString() });

          setTimeout(() => {
            waitingToIntercept = true;
          }, 500);
        } catch (e) {
          console.warn("❌ Failed to modify URL:", e);
          callback({ cancel: false });
        }
      } else {
        callback({ cancel: false });
      }
    }
  );

  ipcMain.on("set-date", (_, date) => {
    selectedDate = date;
    console.log("📅 Selected date set to:", selectedDate);
    win.loadURL(
      "https://kurt3.ghum.kuleuven.be/selection?locationId=1&resourceTypeId=302"
    );
    setupMenu();
  });
}

function setupMenu() {
  const template = [
    {
      label: "KURT3 Signup Tool",
      submenu: [
        {
          label: `Current Date: ${getFormattedDate()}`,
          enabled: false,
        },
        {
          label: "Change Date",
          click: () => {
            win.loadFile("index.html");
          },
        },
        {
          type: "separator",
        },
        {
          label: "Restart App",
          click: () => {
            app.relaunch();
            app.exit();
          },
        },
        {
          label: "Quit",
          click: () => app.quit(),
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(createWindow);
