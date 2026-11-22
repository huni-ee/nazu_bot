/*
 * 참고:
 * https://github.com/seojun0602/melon-kakaolink
 * Copyright (c) 2025 서준 (seojun0602), MIT License
 */
import type { Channel, KakaoLink, MessageChat } from '@huni_ee/nazu';

interface MelonSearchResponse {
  ERROR?: unknown;
  SONGCONTENTS: Array<{
    SONGID: string | number;
  }>;
}

interface MelonShareResponse {
  status: number | string;
  contents: {
    ShareListenList: MelonSong[];
  };
}

interface MelonSong {
  adult: boolean | number | string;
  albumImgPath: string;
  songName: string;
  songId: string | number;
  artistList: Array<{
    artistName: string;
  }>;
}

export class Melon {
  static async sendSong(chat: MessageChat, channel: Channel, kakaoLink: KakaoLink): Promise<void> {
    const query = chat.param;
    if (query.length === 0) {
      await channel.send('"!멜론 검색어"로 입력하세요.');
      return;
    }

    try {
      const song = await findMelonSong(query);
      if (!song) {
        await channel.send('곡이 존재하지 않습니다.');
        return;
      }

      if (channel.name === null) return;

      await kakaoLink.send({
        receiverName: channel.name,
        templateId: 17141, // 템플릿 ID 값 변경하지 마세요.
        templateArgs: {
          KMA: song.adult,
          THUMB_URL: song.albumImgPath,
          TITLE: song.songName,
          ARTIST: song.artistList[0].artistName,
          SONG_ID: song.songId,
        },
      });
    } catch (error) {
      console.error('멜론 카카오링크 전송 중 오류가 발생했습니다.', error);
      await channel.send('멜론 검색 중 오류가 발생했습니다.');
    }
  }

}

async function findMelonSong(query: string): Promise<MelonSong | null> {
  const searchUrl = new URL('https://www.melon.com/search/keyword/index.json');
  searchUrl.searchParams.set('j', '');
  searchUrl.searchParams.set('query', query);

  const searchResponse = await fetch(searchUrl, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'Mozilla/5.0',
    },
  });

  const searchResult = await searchResponse.json() as MelonSearchResponse;
  if (searchResult.ERROR) return null;
  const songId = searchResult.SONGCONTENTS[0].SONGID;

  const shareUrl = new URL('https://kkosvc.melon.com/mwk/sharelisten/sharelisten.json');
  shareUrl.searchParams.set('songIds', String(songId));

  const shareResponse = await fetch(shareUrl, {
    headers: { Accept: 'application/json' },
  });

  const shareResult = await shareResponse.json() as MelonShareResponse;
  if (shareResult.status != 0) return null;
  return shareResult.contents.ShareListenList[0];
}
