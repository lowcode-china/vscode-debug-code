import { Provider } from "../types";
import * as vscode from "vscode";
import { isFile } from "../utils";
import * as _ from "lodash";
import * as output from "../utils/output";

export const Providers: Record<string, Provider> = {
  cargo: {
    configuration: {
      type: "lldb",
      request: "launch",
      name: "Cargo",
      args: [],
      cargo: {
        args: ["build"],
      },
    },
    runConfig: {
      pattern: "cargo\\s(run|test)\\s?(?<args>.*)",
      map: {
        type: "$type",
        args: "$args",
      },
    },
  },
  javascript: {
    configuration: {
      request: "launch",
      args: [],
      name: "Node",
      type: "node",
    },
    runConfig: {
      pattern: "(?<type>node)\\s(?<program>\\S+)\\s?(?<args>.*)",
      map: {
        type: "$type",
        program: "$program",
        args: "$args",
      },
    },
  },
  jest: {
    configuration: {
      type: "node",
      request: "launch",
      name: "Jest",
      program: "/usr/local/bin/jest",
      console: "integratedTerminal",
      cwd: "${fileDirname}",
      args: ["--rootDir", "${fileDirname}"],
      windows: {
        program: "/usr/local/bin/jest",
      },
    },
  },
  typescript: {
    configuration: {
      request: "launch",
      name: "Typescript",
      type: "node",
      args: [],
      runtimeArgs: ["-r", "ts-node/register"],
    },
    runConfig: {
      pattern: "(?<type>node)\\s(?<program>\\S+)\\s?(?<args>.*)",
      map: {
        type: "$type",
        program: "$program",
        args: "$args",
      },
    },
  },
  "python-module": {
    configuration: {
      request: "launch",
      name: "Python Module",
      type: "python",
      justMyCode: false,
      args: []
    },
    extensions: ["ms-python.python"],
    runConfig: {
      pattern: "(?<type>python)\\s-m\\s(?<module>\\S+)\\s?(?<args>.*)",
      map: {
        type: "$type",
        module: "$module",
        args: "$args",
      },
    },
  },
  python: {
    configuration: {
      request: "launch",
      name: "Python",
      type: "python",
      justMyCode: false,
      args: []
    },
    extensions: ["ms-python.python"],
    runConfig: {
      pattern: "(?<type>python)\\s(?<program>\\S+)\\s?(?<args>.*)",
      map: {
        type: "$type",
        program: "$program",
        args: "$args",
      },
    },
  },
  go: {
    configuration: {
      request: "launch",
      name: "Golang",
      type: "go",
      mode: "auto",
      args: []
    },
    extensions: ["golang.go"],
    runConfig: {
      pattern: "(?<type>go)\\s(?<mode>run|test)\\s?(?<program>\\S*)\\s?(?<args>.*)",
      map: {
        mode: (value) => {
          if (value === "run") {
            return "auto"
          } else if (value === "test") {
            return "test"
          }
        },
        type: "$type",
        program: "$program",
        args: "$args",
      },
    },
  },
};

export const defaultProvider: Provider = {
  configuration: {
    type: "",
    name: "",
    request: "launch",
  },
};

export async function getProvider(uri: vscode.Uri, ...args: any[]) {
  if (!isFile(uri.fsPath)) return;

  const { languageId } = await getDocument(uri);

  let provider = Providers[languageId];
  if (!provider) {
    output.info(`The ${languageId} provider does not exist!`);
    return;
  }

  const base = _.cloneDeep(defaultProvider);

  let configuration = Object.assign(base.configuration, provider.configuration);
  configuration.program = uri.fsPath;
  configuration.args = args;

  let result = Object.assign(base, provider, { configuration }) as Provider;
  return result;
}

export function getSuportLanguages() {
  return Object.keys(Providers);
}

export function getProviderTypes() {
  const types = Object.values(Providers).map((provider) => {
    return _.get(provider, "configuration.type");
  });
  return types;
}

async function getDocument(uri: vscode.Uri) {
  const editors = vscode.window.visibleTextEditors;
  for (const key in editors) {
    const editor = editors[key];
    if (editor.document.uri.fsPath === uri.fsPath) {
      return editor.document;
    }
  }

  let document = await vscode.workspace.openTextDocument(uri);
  return document;
}
