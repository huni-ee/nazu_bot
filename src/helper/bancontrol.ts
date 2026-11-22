import { addBan, banCheck, isAdmin, removeBan } from '@huni_ee/nazu';
import type { Channel, MessageChat, User } from '@huni_ee/nazu';

export class BanControl {
  @isAdmin
  static async banUser(chat: MessageChat, channel: Channel): Promise<void> {
    const users = await BanControl.getTargets(chat, channel);
    if (users.length === 0) return;

    const addedUsers: User[] = [];
    const bannedUsers: User[] = [];
    for (const user of users) {
      if (banCheck(user)) {
        bannedUsers.push(user);
      }
      else {
        addBan(user);
        addedUsers.push(user);
      }
    }

    const message: string[] = [];
    if (addedUsers.length > 0) {
      message.push(`[${addedUsers.map((user) => user.name).join(', ')}]님을 밴 목록에 등록하였습니다.`);
    }
    if (bannedUsers.length > 0) {
      message.push(`[${bannedUsers.map((user) => user.name).join(', ')}]님은 이미 밴 등록된 유저입니다.`);
    }
    await channel.send(message.join('\n'));
  }

  @isAdmin
  static async unbanUser(chat: MessageChat, channel: Channel): Promise<void> {
    const users = await BanControl.getTargets(chat, channel);
    if (users.length === 0) return;

    const removedUsers: User[] = [];
    const notBannedUsers: User[] = [];
    for (const user of users) {
      if (banCheck(user)) {
        removeBan(user);
        removedUsers.push(user);
      }
      else {
        notBannedUsers.push(user);
      }
    }

    const message: string[] = [];
    if (removedUsers.length > 0) {
      message.push(`[${removedUsers.map((user) => user.name).join(', ')}]님을 밴 목록에서 삭제하였습니다.`);
    }
    if (notBannedUsers.length > 0) {
      message.push(`[${notBannedUsers.map((user) => user.name).join(', ')}]님은 밴 목록에 없습니다.`);
    }
    await channel.send(message.join('\n'));
  }

  private static async getTargets(chat: MessageChat, channel: Channel): Promise<User[]> {
    if (chat.isReply()) {
      const source = await chat.getSource();
      if (source.user !== null) return [source.user];
    }

    const mentions = await chat.mentions;
    const users = mentions.filter((user, index) => mentions.findIndex((u) => u.id === user.id) === index);
    if (users.length > 0) return users;

    await channel.send('대상 유저를 멘션하거나 메시지에 답장하세요.');
    return [];
  }
}
