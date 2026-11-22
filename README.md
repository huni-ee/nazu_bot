# Arisa + Nazu 기반 샘플 봇

[Nazu](https://github.com/huni-ee/nazu)로 [Arisa](https://github.com/ye-seola/arisa2) 서버에 연결해 카카오톡 메시지를 받고 명령어에 응답합니다.

## 시작하기

### 준비

- Node.js 24.11.0 이상
- 실행 중인 Arisa 서버 (설치 및 실행 방법은 [환경 준비 문서](https://nazu.huniee.dev/docs) 참고)

### 초기 설정

1.  **저장소 복제 및 패키지 설치:**
    ```bash
    git clone https://github.com/huni-ee/nazu_bot
    cd nazu_bot
    npm install
    ```

2.  **Arisa 서버 주소 설정:**
    `src/index.ts`의 `target`을 Arisa 서버 주소로 바꿉니다. 기본값은 `127.0.0.1:3000`입니다.
    ```ts
    const client = new ArisaClient({
      target: '127.0.0.1:3000'
    });
    ```

3.  **API 키 설정(Optional):**
    `.env.example`을 `.env`로 복사한 뒤 값을 넣습니다.
    ```bash
    cp .env.example .env
    ```
    - `KAKAO_APP_KEY`, `KAKAO_ORIGIN`: [Kakao Developers](https://developers.kakao.com)에서 발급받은 JavaScript 키와 웹 플랫폼 도메인
    - `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET`: 네이버 검색 API 키 ([네이버 검색 API](#네이버-검색-api) 참고)

4.  **실행:**
    ```bash
    npm start
    ```
    코드를 수정할 때 자동으로 다시 실행하려면 `npm run dev`를 사용합니다. 수정한 뒤에는 `npm run check`(타입 검사)와 `npm run lint`(코드 검사)로 문제를 확인할 수 있습니다.

5.  **관리자 설정:**
    봇을 실행한 뒤 대시보드(`http://127.0.0.1:3001`)에서 관리자를 추가합니다. 관리자와 밴 목록은 `data/arisa.db`에 저장됩니다.

## 네이버 검색 API

`!사진`은 네이버 이미지 검색 API를 사용합니다. `src/bots/photo.ts`에 두 가지 방식이 들어 있습니다.

| 방식 | 키 발급 | 상태 |
|---|---|---|
| [네이버 개발자 센터](https://developers.naver.com) | Client ID / Client Secret | 기본 사용 |
| [NAVER API HUB](https://www.ncloud.com) | 네이버 클라우드 플랫폼 콘솔의 API HUB 앱 Client ID / Client Secret | 주석 처리 |

네이버 개발자 센터의 검색 API는 NAVER API HUB로 이관되었습니다. 개발자 센터는 2026년 7월 31일부터 신규 신청을 받지 않으며, 기존 키는 2027년 6월 30일까지만 지원됩니다.

**2026년 7월 31일 이후에 키를 새로 발급받는다면 NAVER API HUB만 쓸 수 있습니다.** `src/bots/photo.ts`의 `findImage()`에서 네이버 개발자 센터 부분을 주석 처리하고, NAVER API HUB 부분의 주석을 해제하면 됩니다. `.env`의 키 이름은 같지만, 값은 NAVER API HUB에서 새로 발급받은 키로 바꿔야 합니다. 개발자 센터에서 받은 키로는 NAVER API HUB를 호출할 수 없습니다.

## 라이선스

Apache License 2.0을 따릅니다. 전문은 [`LICENSE`](LICENSE)를 참고하세요.

## 참고한 프로젝트

- [Iris_bot](https://github.com/dolidolih/Iris_bot)
- [melon-kakaolink](https://github.com/seojun0602/melon-kakaolink)
