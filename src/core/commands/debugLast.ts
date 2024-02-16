import * as vscode from "vscode";
import { getLastCommandTxtPath } from "../../utils";
import { runLineCommand } from "./debugHere";
import * as output from "../../utils/output";

/**
 * Debug last command
 */
export async function debugLast(
  context: vscode.ExtensionContext,
  uri: vscode.Uri
) {
  const { path: debugLastCommandTxtPath } = getLastCommandTxtPath(context);
  if (!debugLastCommandTxtPath) {
    return;
  }
  const debugLastCommandTxt = vscode.Uri.file(debugLastCommandTxtPath);
  const buffer = await vscode.workspace.fs.readFile(debugLastCommandTxt);
  let { uri: uri_, filename, command } = JSON.parse(buffer.toLocaleString());
  uri_ = vscode.Uri.file(uri_);
  runLineCommand(command, filename, uri_, context);

  output.info(`Debug last: ${uri}`);
}
