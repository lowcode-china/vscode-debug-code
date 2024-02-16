import * as vscode from "vscode";
import { getProvider } from "../../config";
import { Extension } from "../extension";
import * as _ from "lodash";
import * as path from "path";
import { workspace, WorkspaceConfiguration } from "vscode";
import { runConfiguration } from "../../utils/api";
import * as output from "../../utils/output";

/**
 * Debug file
 */
export async function debugFile(
  context: vscode.ExtensionContext,
  uri: vscode.Uri
) {
  if (!uri) {
    if (vscode.window.activeTextEditor) {
      uri = vscode.window.activeTextEditor.document.uri;
    } else {
      return;
    }
  }
  output.info(`Debug file: uri`)

  if (uri.scheme === "file") {
    let provider = await getProvider(uri);
    if (!provider) return;

    if (provider.extensions) {
      const hasUninstalled = await Extension.instance.checkToInstall(
        provider.extensions
      );
      if (hasUninstalled) return;
    }

    const launchConfiguration = workspace.getConfiguration("launch");
    const configurations: Array<WorkspaceConfiguration> =
      launchConfiguration.get("configurations") || [];

    const filename = path.basename(uri.path);
    const configurationName = `debug ${filename}`;

    let configuration: any = _.find(configurations, (config) => {
      return config.name === configurationName;
    });

    if (!configuration) {
      configuration = { ...provider.configuration, name: configurationName };
      configurations.push(configuration);
      launchConfiguration.update("configurations", configurations);
    }

    runConfiguration(configuration);
    vscode.commands.executeCommand("workbench.debug.action.focusRepl");
  }
}
