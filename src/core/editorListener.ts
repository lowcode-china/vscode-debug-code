import * as vscode from "vscode";
import { getProvider } from "../config";
import { Extension } from "./extension";


class ActiveTextEditorListener {
  private disposer?: vscode.Disposable;

  constructor() {
    // 首次立即检查
    if (vscode.window.activeTextEditor) {
      console.log(`Active doc languageId: ${vscode.window.activeTextEditor?.document.languageId}`);
      this.onChange(vscode.window.activeTextEditor);
    }

    this.disposer = vscode.window.onDidChangeActiveTextEditor(editor => {
      console.log(`Active doc languageId: ${editor?.document.languageId}`);
      this.onChange(editor);
    });
  }

  public dispose() {
    this.disposer?.dispose();
  }

  private async onChange(editor: vscode.TextEditor | undefined, resetCache?: boolean) {
    if (!editor) {
      return;
    }

    let doc = editor.document;
    let provider = await getProvider(doc.uri);
    if (provider && provider.extensions) {
      await Extension.instance.checkToInstall(provider.extensions);
    }
  }
}

export function initEditorListener() {
  new ActiveTextEditorListener();
}