import { hasParam } from '@huni_ee/nazu';
import type { Channel, MessageChat } from '@huni_ee/nazu';

const CLIENT_ID = process.env.NAVER_CLIENT_ID ?? '';
const CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET ?? '';

const disallowedSubstrings = ['medium.com', 'post.phinf.naver.net', '.gif', 'imagedelivery.net', 'clien.net'];

interface NaverImageResponse {
  items: Array<{
    link: string;
  }>;
}

export class Photo {
  @hasParam
  static async sendImage(chat: MessageChat, channel: Channel): Promise<void> {
    const query = chat.param;

    try {
      const imageUrl = await findImage(query);
      if (imageUrl === null) {
        await channel.send('사진 검색에 실패했습니다.');
        return;
      }

      await channel.sendMedia(imageUrl);
    } catch (error) {
      console.error('사진 전송 중 오류가 발생했습니다.', error);
      await channel.send('사진 검색 중 오류가 발생했습니다.');
    }
  }
}

async function findImage(query: string): Promise<string | null> {
  /**
   * 네이버 개발자 센터 (https://developers.naver.com)
   */
  const searchUrl = new URL('https://openapi.naver.com/v1/search/image');
  searchUrl.searchParams.set('query', query);
  searchUrl.searchParams.set('display', '20');

  const searchResponse = await fetch(searchUrl, {
    headers: {
      'X-Naver-Client-Id': CLIENT_ID,
      'X-Naver-Client-Secret': CLIENT_SECRET,
    },
  });

  /**
   * NAVER API HUB (https://www.ncloud.com)
   */
  // const searchUrl = new URL('https://naverapihub.apigw.ntruss.com/search/v1/image');
  // searchUrl.searchParams.set('query', query);
  // searchUrl.searchParams.set('display', '20');
  //
  // const searchResponse = await fetch(searchUrl, {
  //   headers: {
  //     'X-NCP-APIGW-API-KEY-ID': CLIENT_ID,
  //     'X-NCP-APIGW-API-KEY': CLIENT_SECRET,
  //   },
  // });

  if (!searchResponse.ok) return null;

  const searchResult = await searchResponse.json() as NaverImageResponse;
  const links = searchResult.items
    .map((item) => item.link)
    .filter((link) => !disallowedSubstrings.some((substring) => link.includes(substring)));
  if (links.length === 0) return null;

  return links[Math.floor(Math.random() * links.length)];
}
