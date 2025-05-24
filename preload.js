const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  setDate: (date) => ipcRenderer.send("set-date", date),
});