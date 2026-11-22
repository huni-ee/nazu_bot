import { hasParam } from '@huni_ee/nazu';
import type { Channel, MessageChat } from '@huni_ee/nazu';

interface Artist {
  artistName: string;
}

interface Track {
  trackId: number;
  trackTitle: string;
  artists: Artist[];
}

interface LyricsSearchResult {
  response: {
    result: {
      tracks: Track[];
    };
  };
}

interface TrackSearchResult {
  response: {
    result: {
      trackResult: {
        tracks: Track[];
      };
    };
  };
}

interface LyricsResult {
  response: {
    result: {
      lyric: {
        normalLyric: {
          text: string;
        };
      };
    };
  };
}

export class Lyrics {
  @hasParam
  static async findLyrics(chat: MessageChat, channel: Channel): Promise<void> {
    const query = chat.param;
    try {
      const url = new URL('https://apis.naver.com/vibeWeb/musicapiweb/v4/search/lyric');
      url.search = new URLSearchParams({
        query,
        start: '1',
        display: '10',
        sort: 'RELEVANCE',
      }).toString();

      const response = await fetch(url, {
        headers: { Accept: 'application/json' },
      });
      const result = await response.json() as LyricsSearchResult;
      const tracks = result.response.result.tracks.slice(0, 5);
      const message = tracks.map((track, index) =>
        `${index + 1}. ${track.artists[0].artistName} - ${track.trackTitle}`
      );

      await channel.send(message.join('\n'));
    } catch {
      await channel.send('검색된 노래가 없습니다.');
    }
  }

  @hasParam
  static async getLyrics(chat: MessageChat, channel: Channel): Promise<void> {
    const query = chat.param;
    try {
      const searchUrl = new URL('https://apis.naver.com/vibeWeb/musicapiweb/v4/searchall');
      searchUrl.search = new URLSearchParams({
        query,
        sort: 'RELEVANCE',
        vidDisplay: '25',
        trDisplay: '9',
        alDisplay: '21',
        arDisplay: '21',
      }).toString();

      const searchResponse = await fetch(searchUrl, {
        headers: { Accept: 'application/json' },
      });
      const searchResult = await searchResponse.json() as TrackSearchResult;
      const track = searchResult.response.result.trackResult.tracks[0];
      let message = `${track.artists[0].artistName} - ${track.trackTitle}\n${'\u200b'.repeat(500)}\n`;

      const lyricUrl = new URL(`https://apis.naver.com/vibeWeb/musicapiweb/vibe/v4/lyric/${track.trackId}`);
      const lyricResponse = await fetch(lyricUrl, {
        headers: { Accept: 'application/json' },
      });
      const lyricResult = await lyricResponse.json() as LyricsResult;
      message += lyricResult.response.result.lyric.normalLyric.text;

      await channel.send(message);
    } catch (error) {
      await channel.send('검색된 노래가 없습니다.');
      console.error(error);
    }
  }

}
