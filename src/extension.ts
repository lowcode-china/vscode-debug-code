import * as vscode from 'vscode'
import { registerCommands } from './core/commands'
import { initEditorListener } from './core/editorListener'
import { setupLocale } from "./utils"

export function activate(context: vscode.ExtensionContext) {
  
  setupLocale(context.extensionPath)

  registerCommands(context)

  initEditorListener()
  
  // const messageDone = vscode.l10n.t("Debug file", { done: 'FINISHED' });
  // vscode.window.showInformationMessage(messageDone);
}

export function deactivate() { }
