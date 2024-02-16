import * as vscode from "vscode";
import { getWorkspaceFolder, getLastCommandTxtPath } from "../../utils";
import { defaultProvider, Providers } from "../../config";
import * as _ from "lodash";
import * as path from "path";
import { runConfiguration, runCommandInTerminal } from "../../utils/api";
import * as output from "../../utils/output";

/**
 * Get launch config's properties from current line, eg, cwd
 */
function getPropsFromText(currentLine: string) {
  const props = {};
  for (let part of currentLine.split(";")) {
    part = _.trim(part);
    const result = /\$(.+?)=(.+)/.exec(part);
    if (result) {
      const [, key, value] = result;
      props[key] = value;
      continue;
    }
  }
  return props;
}

/**
 * Get environment variables from current line.
 */
function getEnvsFromText(currentLine: string) {
  const envs = {};
  for (let part of currentLine.split("; ")) {
    part = _.trim(part);
    if (part.startsWith("$")) continue;
    const result = /(.+?)=(.+)/.exec(part);
    if (result) {
      const [, key, value] = result;
      envs[key] = value.replace(/^["']|["']$/g, "");
      continue;
    }
  }
  return envs;
}

/**
 * Get command from current line, eg, `python -m pytest`, `python manage.py runserver`
 */
function getCommandFromText(currentLine: string) {
  const pattern = /(python|go|node|cargo)\s+(.+)/i;
  for (let part of currentLine.split(";")) {
    const result = pattern.exec(part);
    if (result) {
      return result[0];
    }
  }
}

/**
 * Get current line
 */
function getCurrentLine(): string {
  let currentLine = "";
  const activeTextEditor = vscode.window.activeTextEditor;
  if (activeTextEditor) {
    let lineNumber = activeTextEditor.selection.active.line;
    currentLine = activeTextEditor.document.lineAt(lineNumber).text;
  }
  return currentLine;
}

/**
 * Run python test
 */
function runPythonTest(currentLine: string, uri: vscode.Uri) {
  const provider = _.merge(
    _.cloneDeep(defaultProvider),
    Providers["python-module"]
  );
  const configuration = provider.configuration;
  const pattern = /def.*?(\S+)\(.*?\)/;
  const result = pattern.exec(currentLine);
  if (!result) return;
  const funcName = result[1];
  const workspaceFolder = getWorkspaceFolder(uri);
  const runFile = path.relative(workspaceFolder, uri.fsPath);
  configuration.module = "pytest";
  configuration.args = [`${runFile}::${funcName}`, "-s"];
  runConfiguration(configuration);
}

/**
 * Run golang test
 */
function runGoTest(currentLine: string, uri: vscode.Uri) {
  const provider = _.merge(_.cloneDeep(defaultProvider), Providers["go"]);
  const configuration = provider.configuration;
  const pattern = /func.*?(\S+)\(.*?\)/;
  const result = pattern.exec(currentLine);
  if (!result) return;
  const funcName = result[1];
  const workspaceFolder = getWorkspaceFolder(uri);
  const runFile = path.relative(workspaceFolder, uri.fsPath);
  configuration.program = `${workspaceFolder}/${runFile}`;
  configuration.args = ["-test.v", "-test.run", funcName];
  runConfiguration(configuration);
}

/**
 * Run jest
 */
function runJest(
  currentLine: string,
  uri: vscode.Uri,
  context: vscode.ExtensionContext
) {
  const provider = _.merge(_.cloneDeep(defaultProvider), Providers["jest"]);
  const configuration = provider.configuration;
  const extensionPath = context.extensionPath;
  const jestConfigPath = path.join(
    extensionPath,
    "resources",
    "jest.config.js"
  );
  const jestExecutable = path.join(
    extensionPath,
    "node_modules",
    "jest",
    "bin",
    "jest"
  );
  configuration.program = jestExecutable;
  configuration.windows.program = jestExecutable;
  configuration.args.push(...["-c", jestConfigPath]);
  const pattern = /test\(['|"](.+)['|"]/;
  const result = pattern.exec(currentLine);
  if (!result) return;
  const funcName = result[1];
  configuration.args.push(...["-t", funcName]);
  runConfiguration(configuration);
}

/**
 * Run cargo
 */
function runCargo(
  currentLine: string,
  uri: vscode.Uri,
  context: vscode.ExtensionContext
) {
  const provider = _.merge(_.cloneDeep(defaultProvider), Providers["cargo"]);
  const configuration = provider.configuration;
  const runConfig = _.get(provider, "runConfig");
  const pattern = runConfig.pattern;
  const map = runConfig.map;
  const regex = new RegExp(pattern);
  const command = getCommandFromText(currentLine);
  const result = regex.exec(command);
  const cargoArgs = _.compact(result.groups.args.split(" "));
  configuration.cargo.args.push(...cargoArgs);
  const props = getPropsFromText(currentLine);
  Object.assign(configuration, props);
  runConfiguration(configuration);
}

/**
 * Remove extra spaces and special characters.
 */
function cleanCurrentLine(currentLine: string) {
  currentLine = currentLine.replace("&&", ";").replace("  ", "");
  return _.trim(currentLine);
}

export async function runLineCommand(
  lineCommand: string,
  filename: string,
  uri: vscode.Uri,
  context: vscode.ExtensionContext
) {
  if (filename.endsWith(".py") && lineCommand.startsWith("def test_")) {
    return runPythonTest(lineCommand, uri);
  }

  if (filename.endsWith(".go") && lineCommand.startsWith("func Test")) {
    return runGoTest(lineCommand, uri);
  }

  if (filename.endsWith(".js") && lineCommand.startsWith("test")) {
    return runJest(lineCommand, uri, context);
  }

  if (filename.endsWith(".ts") && lineCommand.startsWith("test")) {
    return runJest(lineCommand, uri, context);
  }

  if (filename.endsWith(".rs") && lineCommand.includes("cargo run")) {
    return runCargo(lineCommand, uri, context);
  }

  const props = getPropsFromText(lineCommand);
  const envs = getEnvsFromText(lineCommand);
  const command = getCommandFromText(lineCommand);
  let configuration = undefined;

  for (const key of Object.keys(Providers)) {
    const provider = _.merge(_.cloneDeep(defaultProvider), Providers[key]);
    const runConfig = _.get(provider, "runConfig");
    if (!runConfig) continue;

    const pattern = runConfig.pattern;
    const map = runConfig.map;
    const regex = new RegExp(pattern);
    const result = regex.exec(command);

    if (!result || _.isEmpty(result.groups)) {
      continue;
    }

    configuration = _.cloneDeep(provider.configuration);
    const args = _.compact(result.groups.args.split(" "));
    configuration.args.push(...args);

    for (const key of Object.keys(map)) {
      let prop = map[key];
      if (_.isFunction(prop)) {
        prop = prop(result.groups[key]);
      }
      if (prop.startsWith("$")) {
        prop = prop.substring(1);
        prop = result.groups[prop];
      }
      if (_.isArray(provider.configuration[key])) {
        prop = _.compact(prop.split(" "));
      }

      if (!result.groups[key]) continue;

      if (_.isArray(configuration[key]) && _.isArray(prop)) {
        Object.assign(configuration[key], prop);
      } else {
        configuration[key] = prop;
      }
    }
    break;
  }

  if (configuration) {
    configuration = { ...configuration, ...props };
    if (!configuration.env) {
      configuration.env = envs;
    } else {
      Object.assign(configuration.env, envs);
    }
    runConfiguration(configuration);
    vscode.commands.executeCommand("workbench.debug.action.focusRepl");
  } else {
    runCommandInTerminal(lineCommand);
  }
}

/**
 * Debug current line.
 * @param uri
 */
export async function debugHere(
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
  const filename = path.basename(uri.path);

  let currentLine = getCurrentLine();
  currentLine = cleanCurrentLine(currentLine);
  output.info(`Debug here: ${currentLine}`);

  runLineCommand(currentLine, filename, uri, context);

  const { path: debugLastCommandTxtPath } = getLastCommandTxtPath(context);
  const debugLastCommandTxt = vscode.Uri.file(debugLastCommandTxtPath);
  const commandData = {
    uri: uri.path,
    filename: filename,
    command: currentLine,
  };
  await vscode.workspace.fs.writeFile(
    debugLastCommandTxt,
    Buffer.from(JSON.stringify(commandData))
  );
}
