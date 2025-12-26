import { Menu, shell, BrowserWindow, app } from "electron";

/**
 * Create the application menu for the Electron app.
 *
 * Includes platform-specific menus:
 * - macOS: Special app menu with About, Services, Hide, Quit
 * - File: Import/Export, Quit
 * - Edit: Standard undo/redo/cut/copy/paste
 * - View: Reload, DevTools, Zoom, Fullscreen
 * - Window: Minimize, Zoom, Close (with macOS variants)
 * - Help: Documentation, About dialog
 *
 * @param mainWindow - The main application window
 * @returns Configured Electron Menu
 *
 * @example
 * const menu = createMenu(mainWindow);
 * Menu.setApplicationMenu(menu);
 */
export function createMenu(mainWindow: BrowserWindow): Menu {
  const isMac = process.platform === "darwin";

  const template: Electron.MenuItemConstructorOptions[] = [
    // App menu (macOS only)
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: "about" as const },
              { type: "separator" as const },
              { role: "services" as const },
              { type: "separator" as const },
              { role: "hide" as const },
              { role: "hideOthers" as const },
              { role: "unhide" as const },
              { type: "separator" as const },
              { role: "quit" as const },
            ],
          },
        ]
      : []),

    // File menu
    {
      label: "File",
      submenu: [isMac ? { role: "close" as const } : { role: "quit" as const }],
    },

    // Edit menu
    {
      label: "Edit",
      submenu: [
        { role: "undo" as const },
        { role: "redo" as const },
        { type: "separator" as const },
        { role: "cut" as const },
        { role: "copy" as const },
        { role: "paste" as const },
        ...(isMac
          ? [
              { role: "pasteAndMatchStyle" as const },
              { role: "delete" as const },
              { role: "selectAll" as const },
            ]
          : [
              { role: "delete" as const },
              { type: "separator" as const },
              { role: "selectAll" as const },
            ]),
      ],
    },

    // View menu
    {
      label: "View",
      submenu: [
        { role: "reload" as const },
        { role: "forceReload" as const },
        { role: "toggleDevTools" as const },
        { type: "separator" as const },
        { role: "resetZoom" as const },
        { role: "zoomIn" as const },
        { role: "zoomOut" as const },
        { type: "separator" as const },
        { role: "togglefullscreen" as const },
      ],
    },

    // Window menu
    {
      label: "Window",
      submenu: [
        { role: "minimize" as const },
        { role: "zoom" as const },
        ...(isMac
          ? [
              { type: "separator" as const },
              { role: "front" as const },
              { type: "separator" as const },
              { role: "window" as const },
            ]
          : [{ role: "close" as const }]),
      ],
    },

    // Help menu
    {
      label: "Help",
      submenu: [
        {
          label: "Documentation",
          click: async () => {
            await shell.openExternal("https://github.com/yourusername/9boxer");
          },
        },
        {
          label: "About",
          click: () => {
            const { dialog } = require("electron");
            const version = app.getVersion();

            dialog.showMessageBox(mainWindow, {
              type: "info",
              title: "About 9Boxer",
              message: "9Boxer",
              detail: `Version: ${version}\n\nA talent management tool for performance and potential assessment.\n\n© 2025 Your Company`,
              buttons: ["OK"],
            });
          },
        },
      ],
    },
  ];

  return Menu.buildFromTemplate(template);
}
