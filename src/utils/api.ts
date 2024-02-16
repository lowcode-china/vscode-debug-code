import * as vscode from "vscode";
import { localize } from "../utils";
import * as output from "../utils/output";

/**
 * Register extension command on VSCode.
 * @param context
 * @param command
 * @param callback
 */
export function registerCommand(
  context: vscode.ExtensionContext,
  command: string,
  callback: (...args: any[]) => void
) {
  context.subscriptions.push(
    vscode.commands.registerCommand(command, () => callback(context))
  );
}

/**
 * Shows a `Reload VSCode` prompt dialog.
 */
export function showReloadBox(msg?: string): void {
  const reloadButton = localize("toast.box.reload");
  const message = msg || localize("toast.box.reload.message");
  vscode.window
    .showInformationMessage(message, reloadButton)
    .then((selection) => {
      if (selection === reloadButton) {
        vscode.commands.executeCommand("workbench.action.reloadWindow");
      }
    });
}

let spinnerTimer: NodeJS.Timer | null;
const spinner = {
  frames: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
  interval: 100,
};

/**
 * 在statusbar显示进度信息
 * @param message
 */
export function showSpinner(
  message: string,
  progress?: number,
  total?: number
): void {
  clearSpinner();

  let text = "";
  if (progress && total) {
    text = `[${progress}/${total}]`;
  }

  if (message) {
    text = text ? `${text} ${message}` : `${message}`;
  }

  if (text) {
    text = ` ${text.trim()}`;
  }

  let step = 0;
  const frames: string[] = spinner.frames;
  const length = frames.length;
  spinnerTimer = setInterval(() => {
    vscode.window.setStatusBarMessage(`${frames[step]}${message}`);
    step = (step + 1) % length;
  }, spinner.interval);
}

export function clearSpinner(message: string = ""): void {
  if (spinnerTimer) {
    clearInterval(spinnerTimer);
    spinnerTimer = null;
  }

  vscode.window.setStatusBarMessage(message);
}

export function getWorkspaceFolder(uri: vscode.Uri) {
  if (vscode.workspace.workspaceFolders) {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
    return workspaceFolder?.uri.fsPath;
  }

  return;
}

/**
 * Run launch configuration
 */
export function runConfiguration(configuration: any) {
  output.info(`Runtime Configuration: ${JSON.stringify(configuration)}`)
  vscode.debug.startDebugging(undefined, configuration);
  vscode.debug.onDidTerminateDebugSession((e) => {});
}

/**
 * Run normal command in terminal.
 */
export function runCommandInTerminal(currentLine: string) {
  const terminal = vscode.window.createTerminal("Debug here");
  terminal.show();
  terminal.sendText(currentLine);
}
