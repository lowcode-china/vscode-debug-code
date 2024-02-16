import { outputChannel } from "../globals";

export function info(message: string) {
  outputChannel.appendLine(message);
  // outputChannel.show(true);
}
