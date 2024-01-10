# VSCode-Debug-Code

## Overview

In Visual Studio Code (VSCode), setting up configurations for debugging code is typically a prerequisite, which can be quite cumbersome. When developing command-line tools, the need to configure multiple debug scenarios with different parameter combinations often leads to an abundance of configurations that are not only tedious but also highly variable, thus hindering effective communication among developers. debug-code is a tool designed to generate debug configurations based on text input, simplifying this process.

`Debug file` - Debug the current file, currently supports only .py, .go, .ts, and .js files.

`Debug here` - Parses the text on the current line into a configuration for debugging.

`Debug last` - Re-runs the previous Debug here operation.

## Usage

#### Debug the currently opened file. Currently, debugging of .py, .go, .ts and .js file types is supported.

<img src="https://github.com/lowcode-zh/vscode-debug-code/raw/main/public/debug_file.gif" style="width: 70%; height: 70%;" >

#### Generate and apply debugging configuration for the current line in the Go/Javascript/Typescript language test file for debugging operations.

<img src="https://github.com/lowcode-zh/vscode-debug-code/raw/main/public/debug_here_go_test.gif" style="width: 70%; height: 70%;" >

<img src="https://github.com/lowcode-zh/vscode-debug-code/raw/main/public/debug_here_jest.gif" style="width: 70%; height: 70%;" >

<img src="https://github.com/lowcode-zh/vscode-debug-code/raw/main/public/debug_here_pytest.gif" style="width: 70%; height: 70%;" >

#### Quickly run the steps from the last Debug Here operation again.

<img src="https://github.com/lowcode-zh/vscode-debug-code/raw/main/public/debug_last.gif" style="width: 70%; height: 70%;" >

#### Others

<img src="https://github.com/lowcode-zh/vscode-debug-code/raw/main/public/debug_here_npm.gif" style="width: 70%; height: 70%;" >

<img src="https://github.com/lowcode-zh/vscode-debug-code/raw/main/public/debug_here_ts.gif" style="width: 70%; height: 70%;" >

<img src="https://github.com/lowcode-zh/vscode-debug-code/raw/main/public/debug_here_go.gif" style="width: 70%; height: 70%;" >

<img src="https://github.com/lowcode-zh/vscode-debug-code/raw/main/public/debug_here_python.gif" style="width: 70%; height: 70%;" >
