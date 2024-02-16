import * as vscode from "vscode";
import { registerCommand } from "../../utils";
import { getSuportLanguages } from "../../config";
import { debugFile } from "./debugFile";
import { debugHere } from "./debugHere";
import { debugLast } from "./debugLast";

/**
 * Register commands
 */
export function registerCommands(context: vscode.ExtensionContext) {
  vscode.commands.executeCommand(
    "setContext",
    "debug-code:languages",
    getSuportLanguages()
  );
  registerCommand(context, "debug-code.debugFile", debugFile);
  registerCommand(context, "debug-code.debugHere", debugHere);
  registerCommand(context, "debug-code.debugLast", debugLast);
}
