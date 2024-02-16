import * as vscode from "vscode";
import { localize } from "../utils";
import * as output from "../utils/output";
import { clearSpinner, showReloadBox, showSpinner } from "../utils";

export class Extension {
  private static _instance: Extension;

  private constructor() {}

  public static create(): Extension {
    if (!Extension._instance) {
      Extension._instance = new Extension();
    }

    return Extension._instance;
  }

  public static get instance(): Extension {
    return Extension.create();
  }

  /**
   * 检查并安装扩展
   * @param ids
   */
  public async checkToInstall(ids: string[]): Promise<boolean> {
    let uids = this.getUninstalled(ids);

    if (uids.length) {
      await this.uninstallExtensions(uids);
      await this.installExtensions(uids);

      showReloadBox();

      return true;
    }

    return false;
  }

  private getUninstalled(ids: string[]): string[] {
    let result: string[] = [];
    let exts = this.getAll();
    // @ts-ignore
    result = ids
      .map((id) => {
        if (!exts.find((ext) => id.toLowerCase() === ext.toLowerCase())) {
          return id;
        }
      })
      .filter((item) => !!item);

    return result;
  }

  private async installExtensions(ids: string[]) {
    let steps = 0;
    let total = ids.length;

    for (const id of ids) {
      steps++;
      showSpinner(
        localize("toast.settings.installing.extension", id),
        steps,
        total
      );
      await this.installExtension(id);
    }

    clearSpinner();
  }

  private async uninstallExtensions(ids: string[]) {
    for (const id of ids) {
      await this.uninstallExtension(id);
    }
  }

  /**
   * 获取全部已安装的扩展（不包括禁用的扩展）
   *
   * @param excludedPatterns The glob patterns of the extensions that should be excluded.
   */
  private getAll(): string[] {
    const result: string[] = [];
    for (const ext of vscode.extensions.all) {
      if (!ext.packageJSON.isBuiltin) {
        result.push(ext.id);
      }
    }
    return result;
  }

  /**
   * 安装扩展
   * @param id
   */
  private async installExtension(id: string) {
    try {
      await vscode.commands.executeCommand(
        "workbench.extensions.installExtension",
        id
      );
      return true;
    } catch (error) {
      output.info(error);
    }

    return false;
  }

  /**
   * 卸载扩展
   */
  private async uninstallExtension(id: string) {
    try {
      await vscode.commands.executeCommand(
        "workbench.extensions.uninstallExtension",
        id
      );
      return true;
    } catch (error) {
      output.info(error);
    }
    return false;
  }
}
