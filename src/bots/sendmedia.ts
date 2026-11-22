import { hasParam, isReply } from '@huni_ee/nazu';
import type { Channel, KakaoLink, MessageChat } from '@huni_ee/nazu';
import { imageSize } from 'image-size';

export class SendMedia {
  static async sendHamster(channel: Channel): Promise<void> {
    await channel.sendMedia('res/hamster.jpg');
  }

  static async sendTripleHamster(channel: Channel): Promise<void> {
    await channel.sendMedia(['res/hamster.jpg', 'res/hamster.jpg', 'res/hamster.jpg']);
  }

  @hasParam
  static async sendTts(chat: MessageChat, channel: Channel): Promise<void> {
    await channel.sendMedia(`https://tts-translate.kakao.com/newtone?message=${encodeURIComponent(chat.param)}`);
  }

  @isReply
  static async sendProfileImage(chat: MessageChat, channel: Channel): Promise<void> {
    const imageUrl = await SendMedia.getProfileImage(chat);
    if (imageUrl === null) return;
    await channel.sendMedia(imageUrl);
  }

  @isReply
  static async sendProfileImageKakaoLink(
    chat: MessageChat,
    channel: Channel,
    kakaoLink: KakaoLink
  ): Promise<void> {
    const imageUrl = await SendMedia.getProfileImage(chat);
    if (imageUrl === null) return;
    if (channel.name === null) return;

    const dimensions = await SendMedia.getImageSize(imageUrl);
    if (dimensions === null) return;

    await kakaoLink.send({
      receiverName: channel.name,
      templateId: 3139,
      templateArgs: {
        IMAGE_URL: imageUrl,
        IMAGE_WIDTH: dimensions.width,
        IMAGE_HEIGHT: dimensions.height
      }
    });
  }

  private static async getProfileImage(chat: MessageChat): Promise<string | null> {
    const source = await chat.getSource();
    if (source.user === null) return null;

    return source.user.profileImageUrl;
  }

  private static async getImageSize(imageUrl: string): Promise<{ width: number; height: number } | null> {
    const response = await fetch(imageUrl);
    if (!response.ok) return null;

    const dimensions = imageSize(new Uint8Array(await response.arrayBuffer()));
    if (dimensions.width === undefined || dimensions.height === undefined) return null;

    return { width: dimensions.width, height: dimensions.height };
  }
}
