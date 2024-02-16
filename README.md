# VSCode-Debug-Code

## Overview

This plugin can quickly generate configurations in `launch.json`. It can generate configurations in three commands:

- `Debug file`: It will automatically match the most suitable configuration based on the file extension of the currently opened file in the editor and persist it to `.vscode/launch.json`. You can extend this configuration, such as adding environment variables. Currently, it supports **Python**, **Go**, **TypeScript**, and **JavaScript**.

- `Debug here`: It will parse the text of the line where the mouse cursor is currently located to generate a configuration. Currently, it supports **Python**, **Pytest**, **Rust (Cargo)**, **Go run**, **Go test**, and **Node**.

- `Debug last`: If you have ever run the `Debug here` command, it will be recorded in the `last-commands.txt` file. The `Debug last` command allows you to quickly run the commands in `last-commands.txt`, which acts as a shortcut.

## Why use it?

It helps us dynamically generate `.vscode/launch.json`, which is especially convenient and efficient when developing command-line tools. Imagine you have N parameters for your command-line tool, and the combinations between these parameters result in M different scenarios. That means with traditional methods, you would need M configurations. That’s too cumbersome and not very conducive to direct communication among developers.

Through `Debug here`, you can directly input parameters into the text, for example:
```
$cwd=${workspaceFolder}/python-project; DEBUG=ON; PYTHONPATH="lib1"; python -m a.main --help
```

## Examples

For more [examples](https://github.com/lowcode-china/vscode-debug-code/blob/main/examples/commands.txt), please refer to the code in the examples directory.

### Debug file

<img src="https://github.com/lowcode-zh/vscode-debug-code/raw/main/public/debug_file.gif" style="width: 90%; height: 90%;" >

### Debug here

<img src="https://github.com/lowcode-zh/vscode-debug-code/raw/main/public/debug_here_go_test.gif" style="width: 90%; height: 90%;" ><br>

<img src="https://github.com/lowcode-zh/vscode-debug-code/raw/main/public/debug_here_jest.gif" style="width: 90%; height: 90%;" ><br>

<img src="https://github.com/lowcode-zh/vscode-debug-code/raw/main/public/debug_here_pytest.gif" style="width: 90%; height: 90%;" ><br>

<img src="https://github.com/lowcode-zh/vscode-debug-code/raw/main/public/debug_here_npm.gif" style="width: 90%; height: 90%;" ><br>

<img src="https://github.com/lowcode-zh/vscode-debug-code/raw/main/public/debug_here_ts.gif" style="width: 90%; height: 90%;" ><br>

<img src="https://github.com/lowcode-zh/vscode-debug-code/raw/main/public/debug_here_go.gif" style="width: 90%; height: 90%;" ><br>

<img src="https://github.com/lowcode-zh/vscode-debug-code/raw/main/public/debug_here_python.gif" style="width: 90%; height: 90%;" >

### Debug last

<img src="https://github.com/lowcode-zh/vscode-debug-code/raw/main/public/debug_last.gif" style="width: 90%; height: 90%;" >