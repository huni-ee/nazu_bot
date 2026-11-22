import { isReply } from '@huni_ee/nazu';
import type { Channel, MessageChat } from '@huni_ee/nazu';

export class Reply {
  @isReply
  static async sendOrigin(chat: MessageChat, channel: Channel): Promise<void> {
    let tempChat = await chat.getSource();
    while (tempChat.isReply()) {
      tempChat = await tempChat.getSource();
    }
    if (tempChat.user === null) return;
    await channel.send(`${tempChat.user.name}님이 보낸 원본입니다\n${tempChat.text}`);
  }

  @isReply
  static async sendPrev(chat: MessageChat, channel: Channel): Promise<void> {
    const tempChat = await chat.getSource();
    const previousChat = await tempChat.getPrevChat();
    if (previousChat === null) return;
    await channel.send(previousChat.text);
  }

  @isReply
  static async sendNext(chat: MessageChat, channel: Channel): Promise<void> {
    const tempChat = await chat.getSource();
    const nextChat = await tempChat.getNextChat();
    if (nextChat === null) return;
    await channel.send(nextChat.text);
  }
}
