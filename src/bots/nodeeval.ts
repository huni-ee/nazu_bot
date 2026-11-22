import { execFile } from 'node:child_process';
import type { ExecFileException } from 'node:child_process';
import { promisify } from 'node:util';
import { hasParam, isAdmin } from '@huni_ee/nazu';
import type { Channel, KakaoLink, MessageChat } from '@huni_ee/nazu';

const execFileAsync = promisify(execFile);

export class NodeEval {
  @isAdmin
  @hasParam
  static async nodeEval(chat: MessageChat, channel: Channel): Promise<void> {
    let output: string;
    try {
      const { stdout } = await execFileAsync(process.execPath, ['-p', chat.param], { timeout: 30000 });
      output = stdout.trim();
    } catch (e) {
      const error = e as ExecFileException;
      output = error.killed ? 'timed out' : error.stderr?.split('\n    at ')[0].trim() || error.message;
    }
    await channel.send(output);
  }

  @isAdmin
  @hasParam
  static async arisaEval(chat: MessageChat, channel: Channel, kakaolink: KakaoLink): Promise<void> {
    const startedAt = Date.now();
    try {
      await channel.send(String(await eval(chat.param)));
    } catch (error) {
      await channel.send(String(error));
    }
    await channel.send(`${Date.now() - startedAt}ms`);
  }
}
