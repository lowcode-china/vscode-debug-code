import { ExtensionContext } from 'vscode'
import { registerCommands } from './core/commands/index'
import { initEditorListener } from './core/editorListener'
import { setupLocale } from "./utils"

export function activate(context: ExtensionContext) {
  
  setupLocale(context.extensionPath)
  
  registerCommands(context)

  initEditorListener()
  
}

export function deactivate() { }
