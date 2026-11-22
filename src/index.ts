import 'dotenv/config';
import { ArisaClient, isNotBanned } from '@huni_ee/nazu';
import { BanControl } from './helper/bancontrol.js';
import { Lyrics } from './bots/lyrics.js';
import { Melon } from './bots/melon.js';
import { NodeEval } from './bots/nodeeval.js';
import { Photo } from './bots/photo.js';
import { Reply } from './bots/reply.js';
import { SendMedia } from './bots/sendmedia.js';

/**
 * 여기에 들어가는 인자는 https://nazu.huniee.dev/docs/reference/client#arisaclientoptions 참고
 */
const client = new ArisaClient({
  target: '127.0.0.1:3000',
  botName: 'Arisa',
  dashboard: true
});

/**
 * 카카오링크 설정
 */
const kakaoLink = client.kakaoLink({
  appKey: process.env.KAKAO_APP_KEY ?? '',
  origin: process.env.KAKAO_ORIGIN ?? ''
});

/**
 * 멜론 카카오링크 설정
 * 값 변경하지 마세요.
 */
const melonKakaoLink = client.kakaoLink({
  appKey: '4d545a185d172754667d621049004aa1',
  origin: 'https://melon.com'
});

/**
 * 접두사
 */
const prefix = '!';

/**
 * 메시지를 수신할 때
 */
client.on('message', isNotBanned(async (chat, channel) => {
  if (chat.user === null) return;
  if (chat.text === prefix + 'hi') {
    await channel.send(`${chat.user.name}님 안녕하세요`);
  }
  else if (chat.text === prefix + 'ping') {
    const startedAt = Date.now();
    await channel.send('pong!');
    await channel.send(`${Date.now() - startedAt}ms`);
  }
  // 답장한 메시지를 기준으로 조회
  else if (chat.text === prefix + '원답') {
    await Reply.sendOrigin(chat, channel);
  }
  else if (chat.text === prefix + '윗메') {
    await Reply.sendPrev(chat, channel);
  }
  else if (chat.text === prefix + '밑메') {
    await Reply.sendNext(chat, channel);
  }

  else if (chat.command === prefix + '가사찾기') {
    await Lyrics.findLyrics(chat, channel);
  }
  else if (chat.command === prefix + '노래가사') {
    await Lyrics.getLyrics(chat, channel);
  }

  else if (chat.command === prefix + '멜론') {
    await Melon.sendSong(chat, channel, melonKakaoLink);
  }

  else if (chat.command === prefix + '사진') {
    await Photo.sendImage(chat, channel);
  }

  else if (chat.text === prefix + 'hh') {
    await SendMedia.sendHamster(channel);
  }
  else if (chat.text === prefix + 'hhh') {
    await SendMedia.sendTripleHamster(channel);
  }
  else if (chat.command === prefix + 'tts') {
    await SendMedia.sendTts(chat, channel);
  }

  // 답장한 메시지 작성자의 프로필 사진
  else if (chat.text === prefix + '프사') {
    await SendMedia.sendProfileImage(chat, channel);
  }
  else if (chat.text === prefix + '프사링') {
    await SendMedia.sendProfileImageKakaoLink(chat, channel, kakaoLink);
  }

  // 관리자 전용 명령어
  else if (chat.command === prefix + 'node') {
    await NodeEval.nodeEval(chat, channel);
  }
  else if (chat.command === prefix + 'ev') {
    await NodeEval.arisaEval(chat, channel, kakaoLink);
  }
  else if (chat.command === prefix + 'ban') {
    await BanControl.banUser(chat, channel);
  }
  else if (chat.command === prefix + 'unban') {
    await BanControl.unbanUser(chat, channel);
  }
}));

/**
 * 피드 메시지를 수신할 때
 */
client.on('feed', (chat, channel) => {
  if (chat.isUnknown()) {
    // console.log(chat.raw);
  }
});

/**
 * 누군가 메시지를 지웠을 때
 */
client.on('delete', async (chat, channel) => {
  if (chat.deletedBy === null) return;
  if (channel.isTeamMultiChannel() && chat.deletedChat.byHost === true) {
    await channel.send(`${chat.deletedBy.name}님이 메시지를 가렸어요\n${chat.deletedChat.text}`);
  } else {
    await channel.send(`${chat.deletedBy.name}님이 메시지를 삭제했습니다\n${chat.deletedChat.text}`);
  }
});

/**
 * 누군가 메시지를 수정했을 때
 */
client.on('edit', async (chat, channel) => {
  if (chat.editedBy === null) return;
  await channel.send(`${chat.editedBy.name}님이 메시지를 수정했어요\n수정 전: ${chat.editChat.beforeText}\n수정 후: ${chat.editChat.afterText}`);
});

/**
 * 방장이나 부방장이 메시지를 가렸을 때
 */
client.on('hide', async (chat, channel) => {
  if (chat.hiddenBy === null) return;
  await channel.send(`${chat.hiddenBy.name}님이 ${chat.hiddenChats.length}개 메시지를 가렸어요.`);
});

/**
 * 오픈채팅에 들어왔을 때 반응
 */
client.on('join', async (chat, channel) => {
  await channel.send(`${chat.joinedUser.name}님이 입장했습니다`);
});

/**
 * 단체톡방에 초대했을 때 반응
 */
client.on('invite', async (chat, channel) => {
  if (chat.invitedBy === null) return;
  await channel.send(`${chat.invitedBy.name}님이 ${chat.invitedUsers.map((invitedUser) => invitedUser.name).join(', ')}님을 초대했습니다`);
});

/**
 * 톡방에서 나갈 때
 */
client.on('leave', async (chat, channel) => {
  if (chat.isKicked()) {
    await channel.send(`${chat.leftUser.name}님이 강퇴당했어요`);
  } else if (chat.isSilent()) {
    await channel.send(`${chat.leftUser.name}님이 조용히 나갔어요`);
  } else {
    await channel.send(`${chat.leftUser.name}님 잘가요`);
  }
});

/**
 * 톡방에서 강퇴 당할 때
 */
client.on('kick', async (chat, channel) => {
  if (chat.kickedBy === null) return;
  await channel.send(`${chat.kickedBy.name}님이 ${chat.kickedUser.name}님을 강퇴했습니다`);
});

/**
 * 권한이 바뀔 때
 */
client.on('member_type_change', async (chat, channel) => {
  if (chat.isPromote() && chat.promotedUser) {
    await channel.send(`${chat.promotedUser.name}님이 부방장으로 임명됐어요`);
  } else if (chat.isDemote() && chat.demotedUser) {
    await channel.send(`${chat.demotedUser.name}님이 부방장에서 해제됐어요`);
  } else if (chat.isHandover() && chat.previousHost && chat.newHost) {
    await channel.send(`${chat.previousHost.name}님이 ${chat.newHost.name}님에게 방장을 넘겼어요`);
  }
});

/**
 * 오픈채팅방에서 프로필을 바꿀 때
 */
client.on('open_profile_change', async (beforeUser, afterUser, channel) => {
  await channel.send('프로필 변경이 감지되었습니다!\n' + beforeUser.name + '->' + afterUser.name);
});

/**
 * 처리되지 않은 이벤트 오류를 출력
 */
client.on('error', (error) => {
  console.log(error.event, '이벤트에서 오류가 발생했습니다', error.exception);
});

/**
 * 봇 시작
 * 카카오링크 또는 멜론 카카오링크를 사용하지 않는 경우 주석처리
 */
await kakaoLink.init();
await melonKakaoLink.init();
await client.start();
