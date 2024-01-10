import { Provider } from "../types";
import * as vscode from "vscode";
import { isFile } from "../utils";
import * as _ from "lodash";

export const Providers: Record<string, Provider> = {
  javascript: {
    configuration: {
      request: "launch",
      name: "Node",
      type: "node",
    },
    commandParser: {
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
      runtimeArgs: ["-r", "ts-node/register"],
    },
    commandParser: {
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
    },
    extensions: ["ms-python.python"],
    commandParser: {
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
    },
    extensions: ["ms-python.python"],
    commandParser: {
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
    },
    extensions: ["golang.go"],
    commandParser: {
      pattern: "(?<type>go)\\srun\\s(?<program>\\S+)\\s?(?<args>.*)",
      map: {
        type: "$type",
        program: "$program",
        args: "$args",
      },
    },
  },
};

export const defaultProvider: Provider = {
  configuration: {
    request: "launch",
    cwd: "${workspaceFolder}",
    program: undefined,
    args: [],
  },
};

export async function getProvider(uri: vscode.Uri, ...args: any[]) {
  if (!isFile(uri.fsPath)) return;

  const document = await getDocument(uri);

  let provider = Providers[document.languageId];
  if (!provider) {
    return;
  }

  const base = _.cloneDeep(defaultProvider);
  base.configuration.program = uri.fsPath;
  base.configuration.args = args;

  if (provider.moudles) {
    for (const moudle of provider.moudles) {
      // TODO: 校验module
    }
  }

  let configuration = Object.assign(base.configuration, provider.configuration);
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
