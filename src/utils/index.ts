import * as fs from "fs-extra";
import * as vscode from "vscode";
import * as path from "path";
import * as output from "../utils/output";

export * from "./api";
export * from "./locale";

/**
 * Format the template with specified values.
 *
 * For example:
 *
 * With the template `"Hello, {0} and {1}!"` and the values `["Jack", "Rose"]`, you'll get `"Hello, Jack and Rose!"`.
 *
 * @param {string} template The template string.
 * @param {...any[]} values The values.
 */
export function format(template: string, ...values: any[]) {
  if (template == null) {
    return template;
  }

  return values.reduce((prev, value, index) => {
    return prev.replace(new RegExp(`\\{${index}\\}`, "gm"), value);
  }, template);
}

export function isFile(filePath: string) {
  return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
}

export function isDir(dir: string) {
  return fs.existsSync(dir) && fs.statSync(dir).isDirectory();
}

export function isPlainObject(val: any): boolean {
  return Object.prototype.toString.call(val) === "[object Object]";
}

export function getLastCommandTxtPath(context: vscode.ExtensionContext) {
  const extensionPath = context.extensionPath;
  const debugLastCommandTxtPath = path.join(extensionPath, "last-command.txt");
  if (!fs.existsSync(debugLastCommandTxtPath)) {
    output.info(`last-command.txt does not exist in the extension path !`);
    return {
      path: debugLastCommandTxtPath,
      exists: false,
    };
  }
  return {
    path: debugLastCommandTxtPath,
    exists: true,
  };
}

function getParentDirectoryFromUri(uri) {
  const workspaceFolderUri = vscode.workspace.getWorkspaceFolder(uri);
  if (workspaceFolderUri) {
    // 获取工作区根目录URI
    const rootUri = workspaceFolderUri.uri;

    // 获取当前文件或目录相对于工作区根目录的相对路径
    const relativePath = uri.path.substring(rootUri.path.length + 1);

    // 使用path模块（Node.js内置）来解析并获取父目录
    const pathModule = require("path");
    const parentDir = pathModule.dirname(relativePath);

    // 返回父目录的绝对路径（假设你想要的是绝对路径）
    return pathModule.join(rootUri.fsPath, parentDir);
  } else {
    // 如果uri不在任何已知的工作区中，则可能无法获取到父目录
    output.info("URI is not within a workspace folder.");
    return null;
  }
}
