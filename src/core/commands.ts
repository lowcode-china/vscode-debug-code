import * as vscode from "vscode"
import { registerCommand, getWorkspaceFolder } from "../utils"
import { getProvider, getSuportLanguages, defaultProvider, Providers } from "../config"
import { Extension } from "./extension"
import * as _ from "lodash"
import * as path from "path"
import { workspace, WorkspaceConfiguration } from "vscode"
import * as fs from "fs"

export function getLastCommandTxtPath(context: vscode.ExtensionContext) {
  const extensionPath = context.extensionPath
  const debugLastCommandTxtPath = path.join(extensionPath, 'last-command.txt')
  if (!fs.existsSync(debugLastCommandTxtPath)) {
    console.log("last-command.txt is not exists")
    return {
      path: debugLastCommandTxtPath,
      exists: false
    }
  }
  return {
    path: debugLastCommandTxtPath,
    exists: true
  }
}


/**
 * Register commands
 */
export function registerCommands(context: vscode.ExtensionContext) {
  vscode.commands.executeCommand("setContext", "debug-code:languages", getSuportLanguages())
  registerCommand(context, "debug-code.debugFile", debugFile)
  registerCommand(context, "debug-code.debugHere", debugHere)
  registerCommand(context, "debug-code.debugLast", debugLast)
}

/**
 * Get launch config's properties from current line, eg, cwd
 */
function getPropsFromCurrentLine(currentLine: string) {
  const props = {}
  for (let part of currentLine.split(";")) {
    part = _.trim(part)
    const result = /\$(.+?)=(.+)/.exec(part)
    if (result) {
      const [, key, value] = result
      props[key] = value
      continue
    }
  }
  return props
}

/**
 * Get environment variables from current line.
 */
function getEnvsFromCurrentLine(currentLine: string) {
  const envs = {}
  for (let part of currentLine.split("; ")) {
    part = _.trim(part)
    if (part.startsWith("$"))
      continue
    const result = /(.+?)=(.+)/.exec(part)
    if (result) {
      const [, key, value] = result
      envs[key] = value.replace(/^["']|["']$/g, '')
      continue
    }
  }
  return envs
}

/**
 * Get command from current line, eg, `python -m pytest`, `python manage.py runserver`
 */
function getCommandFromCurrentLine(currentLine: string) {
  const pattern = /(python|go|node)\s+(.+)/i
  for (let part of currentLine.split(";")) {
    const result = pattern.exec(part)
    if (result) {
      return result[0]
    }
  }
}

/**
 * Get current line
 */
function getCurrentLine(): string {
  let currentLine = ""
  const activeTextEditor = vscode.window.activeTextEditor
  if (activeTextEditor) {
    let lineNumber = activeTextEditor.selection.active.line
    currentLine = activeTextEditor.document.lineAt(lineNumber).text
  }
  return currentLine
}

/**
 * Remove extra spaces and special characters.
 */
function cleanUpCurrentLine(currentLine: string) {
  currentLine = currentLine.replace("&&", ";").replace("  ", "")
  return _.trim(currentLine)
}

/**
 * Run launch configuration
 */
function runConfiguration(configuration: any) {
  console.debug(`configuration: \n${JSON.stringify(configuration)}`)
  vscode.debug.startDebugging(undefined, configuration)
  vscode.debug.onDidTerminateDebugSession(e => { })
}

/**
 * Run python test
 */
function runPythonTest(currentLine: string, uri: vscode.Uri) {
  const provider = _.merge(_.cloneDeep(defaultProvider), Providers["python-module"])
  const configuration = provider.configuration
  const pattern = /def.*?(\S+)\(.*?\)/
  const result = pattern.exec(currentLine)
  if (!result)
    return
  const funcName = result[1]
  const workspaceFolder = getWorkspaceFolder(uri)
  const runFile = path.relative(workspaceFolder, uri.fsPath)
  configuration.module = "pytest"
  configuration.args = [`${runFile}::${funcName}`, "-s"]
  runConfiguration(configuration)
}

/**
 * Run golang test
 */
function runGoTest(currentLine: string, uri: vscode.Uri) {
  const provider = _.merge(_.cloneDeep(defaultProvider), Providers["go"])
  const configuration = provider.configuration
  const pattern = /func.*?(\S+)\(.*?\)/
  const result = pattern.exec(currentLine)
  if (!result)
    return
  const funcName = result[1]
  const workspaceFolder = getWorkspaceFolder(uri)
  const runFile = path.relative(workspaceFolder, uri.fsPath)
  configuration.program = `${workspaceFolder}/${runFile}`
  configuration.args = [
    "-test.v",
    "-test.run",
    funcName
  ]
  runConfiguration(configuration)
}

/**
 * Run jest
 */
function runJest(currentLine: string, uri: vscode.Uri, context: vscode.ExtensionContext) {
  const provider = _.merge(_.cloneDeep(defaultProvider), Providers["jest"])
  const configuration = provider.configuration
  const extensionPath = context.extensionPath
  const jestConfigPath = path.join(extensionPath, 'resources', 'jest.config.js')
  const jestExecutable = path.join(extensionPath, 'node_modules', 'jest', 'bin', 'jest')
  configuration.program = jestExecutable
  configuration.windows.program =jestExecutable
  configuration.args.push(...[
    "-c",
    jestConfigPath
  ])
  const pattern = /test\(['|"](.+)['|"]/
  const result = pattern.exec(currentLine)
  if (!result)
    return
  const funcName = result[1]
  configuration.args.push(...[
    "-t", funcName
  ])
  runConfiguration(configuration)
}

/**
 * Run normal command in terminal.
 */
function runCurrentLineInTerminal(currentLine: string) {
  const terminal = vscode.window.createTerminal("Debug here")
  terminal.show()
  terminal.sendText(currentLine)
}


/**
 * Debug file
 */
async function debugFile(context: vscode.ExtensionContext, uri: vscode.Uri) {
  if (!uri) {
    if (vscode.window.activeTextEditor) {
      uri = vscode.window.activeTextEditor.document.uri
    } else {
      return
    }
  }
  console.log("debug file: ", JSON.stringify(uri))

  if (uri.scheme === "file") {
    let provider = await getProvider(uri)
    if (!provider) return

    if (provider.extensions) {
      const hasUninstalled = await Extension.instance.checkToInstall(provider.extensions)
      if (hasUninstalled) return
    }

    const launchConfiguration = workspace.getConfiguration("launch")
    const configurations: Array<WorkspaceConfiguration> = launchConfiguration.get("configurations") || []

    const filename = path.basename(uri.path)
    const configurationName = `debug ${filename}`

    let configuration: any = _.find(configurations, (config) => {
      return config.name === configurationName
    })

    if (!configuration) {
      configuration = { ...provider.configuration, name: configurationName }
      configurations.push(configuration)
      launchConfiguration.update("configurations", configurations)
    }

    runConfiguration(configuration)
    vscode.commands.executeCommand("workbench.debug.action.focusRepl")
  }

}

async function runLineCommand(lineCommand: string, filename: string, uri: vscode.Uri, context: vscode.ExtensionContext) {
  if (filename.endsWith(".py") && lineCommand.startsWith("def test_")) {
    return runPythonTest(lineCommand, uri)
  }

  if (filename.endsWith(".go") && lineCommand.startsWith("func Test")) {
    return runGoTest(lineCommand, uri)
  }

  if (filename.endsWith(".js") && lineCommand.startsWith("test")) {
    return runJest(lineCommand, uri, context)
  }

  if (filename.endsWith(".ts") && lineCommand.startsWith("test")) {
    return runJest(lineCommand, uri, context)
  }

  const props = getPropsFromCurrentLine(lineCommand)
  const envs = getEnvsFromCurrentLine(lineCommand)
  const command = getCommandFromCurrentLine(lineCommand)
  let configuration = undefined

  for (const key of Object.keys(Providers)) {
    const provider = _.merge(_.cloneDeep(defaultProvider), Providers[key])
    const commandParser = _.get(provider, "commandParser")
    if (!commandParser)
      continue

    const pattern = commandParser.pattern
    const map = commandParser.map
    const regex = new RegExp(pattern)
    const result = regex.exec(command)
    if (!result || _.isEmpty(result.groups)) {
      continue
    }

    configuration = _.cloneDeep(provider.configuration)

    for (const key of Object.keys(map)) {
      let prop = map[key]
      if (prop.startsWith("$")) {
        prop = prop.substring(1)
        prop = result.groups[prop]
      }
      if (_.isArray(provider.configuration[key])) {
        prop = prop.split(" ")
      }
      if (!result.groups[key])
        continue
      configuration[key] = prop
    }
    break
  }

  if (configuration) {
    configuration = { ...configuration, ...props }
    if (!configuration.env) {
      configuration.env = envs
    } else {
      Object.assign(configuration.env, envs)
    }
    runConfiguration(configuration)
    vscode.commands.executeCommand("workbench.debug.action.focusRepl")
  } else {
    runCurrentLineInTerminal(lineCommand)
  }
}

/**
 * Debug current line.
 * @param uri 
 */
async function debugHere(context: vscode.ExtensionContext, uri: vscode.Uri) {
  if (!uri) {
    if (vscode.window.activeTextEditor) {
      uri = vscode.window.activeTextEditor.document.uri
    } else {
      return
    }
  }
  const filename = path.basename(uri.path)

  let currentLine = getCurrentLine()
  currentLine = cleanUpCurrentLine(currentLine)
  console.log("current line: ", currentLine)

  runLineCommand(currentLine, filename, uri, context)

  const { path: debugLastCommandTxtPath } = getLastCommandTxtPath(context)
  const debugLastCommandTxt = vscode.Uri.file(debugLastCommandTxtPath)
  const commandData = {
    uri: uri.path,
    filename: filename,
    command: currentLine
  }
  await vscode.workspace.fs.writeFile(debugLastCommandTxt, Buffer.from(JSON.stringify(commandData)))
}

/**
 * Debug last command
 */
async function debugLast(context: vscode.ExtensionContext, uri: vscode.Uri) {
  const { path: debugLastCommandTxtPath } = getLastCommandTxtPath(context)
  if (!debugLastCommandTxtPath) {
    return
  }
  const debugLastCommandTxt = vscode.Uri.file(debugLastCommandTxtPath)
  const buffer = await vscode.workspace.fs.readFile(debugLastCommandTxt)
  let { uri: uri_, filename, command } = JSON.parse(buffer.toLocaleString())
  uri_ = vscode.Uri.file(uri_)
  runLineCommand(command, filename, uri_, context)

  console.log("debug last: ", JSON.stringify(uri))
}