# 포트폴리오 웹사이트

현재 운영 중인 사이트의 로컬 보관본. 2026-11-14 정리.
원본 작품은 `../포트폴리오/`, 실제 페이지와 웹용 미디어는 `dist/`에 있다.
이번 작업에서 원격 배포 상태와 로컬 커밋의 일치를 조회하지 않았으며 커밋·푸시·배포하지 않았다.

## 현재 구성

- `/`, `/dani`: DaNi 페이지. `/HSY`: 황서영 페이지.
- Motion 카드 순서(2026-11-18 변경): 2026 REEL, Until I Know, VOID, MORGENSHTERN, Cut-in Collection, Western. 두 페이지 모두 3번째는 VOID.
  릴은 페이지마다 다른 판: 기본 페이지 `reel`(DaNi판, 원본 `../포트폴리오/REEL_1.mp4`), HSY `reel-hsy`(본명판, `../포트폴리오/REEL.mp4`).
  릴 웹용: 1280x720 H.264 CRF 23 + AAC 128k(각 약 12MB), 썸네일은 4.8초 타이틀 카드, 하이라이트는 24.75~32.75초(Beetlejuice) 640x360 무음.
  릴 카드 썸네일은 사이트 전용 그림 `reel-thumb.jpg`(DaNi, 청록 배경) / `reel-hsy-thumb.jpg`(황서영, 잉크색 배경). 카드 비율 1.45로 그려 잘리지 않는다.
  만드는 코드는 `../포트폴리오-릴/사이트-썸네일/make_reel_thumbs.py`. 작품 항목의 `thumb` 값이 있으면 카드만 그 그림을 쓰고, 영상 포스터는 `슬러그.jpg`(16:9 타이틀 카드)를 쓴다.
  VOID 썸네일은 타이틀 카드(원본 25.5초)로 교체(2026-11-18).
  Backwards와 World Edge Sonata는 목록에서 뺐다(사용자: 일단 제외). `backwards-study*`, `world-edge-sonata*` 파일은 assets에 남겨 두었고 페이지에서 참조하지 않는다.
  2026-11-18 사용자 요청으로 커밋 2a63fec을 main에 푸시해 배포했다(2026-11-14 정리분 포함). 배포 후 실제 주소에서 새 app.js와 릴 파일 응답을 확인했다. `node tools/check-new-works.cjs` 통과(새 순서 기준으로 갱신). 브라우저 화면 확인은 하지 않았다.
- Motion 카드 6개와 컷인 컬렉션 5개. 컬렉션의 상세 영상과 썸네일은 각 작품별로 유지한다.
- Illustration 6개: 스티커 5개, 흰 우표 1개.
  2026-11-18 네 번째 그림을 원본 `../포트폴리오/1 (8).png`로 교체. 기존 스티커 제작 코드(`a060876:refine_assets.py`)의 외곽 연결 흰 배경 제거·28px 여백·31px 최대 필터·미세 불규칙 크림색 테두리·내부 구멍 채움을 동일하게 적용했다. 웹용: `sticker-04.webp`, 재생성: `python tools/make-illustration-04.py`(Pillow 필요). 확대 보기 설명: `캐릭터 출처: Darkest Dungeon`. 원본과 기존 우표 파일은 보존했다.
  2026-11-18 다섯 번째 그림을 원본 `../포트폴리오/1 (9).png`로 교체(확대 보기 설명: `커미션 작업 · 캐릭터: 신청자 OC`)하고, 스티커 1~5번을 한 가지 종이색 방식으로 다시 만들었다. 상세와 재생성 방법은 `tools/illustration/README.md`의 마지막 항목. 4번 재생성은 `python tools/illustration/rebuild.py 4 --publish-assets`를 쓴다(`make-illustration-04.py`는 이전 방식). 이 변경은 커밋·푸시·배포하지 않았다.
- 기본 테마만 남겼다. `?theme=legacy`로 열던 이전 테마 분기는 제거했다.
- `style.css`는 현재 테마도 사용하는 공통 스타일이므로 삭제하지 않는다.

## 수정과 배포 파일

- 일러스트 제작 코드와 원본 대응·재생성 방법: `tools/illustration/README.md`. 2026-11-18 Git 이력에서 과거 제작 원문을 복구하고 현재 6장용 실행 코드를 보존했다. 이 제작 입력은 정리 시 삭제하지 않는다.

- `dist/app.js`: 작품 목록, 동적 영상·썸네일 경로, 뷰어·컬렉션·탭.
- `dist/index.html`, `dani.html`, `HSY.html`: 페이지별 이름·소개·연락처·프로젝트 링크.
- `dist/style.css`, `bauhaus.css`, `bauhaus.js`, `peel.js`, `name-play.js`: 현재 화면과 상호작용.
- `dist/assets`, `fonts`, `vendor`: 현재 미디어, 폰트, 라이브러리와 라이선스.
- `dist/_worker.js`, `_routes.json`: Cloudflare 영상 Range 응답. 영상 탐색 기능에 필요하다.
- `preview.mjs`: `node preview.mjs`로 로컬 정적 서버 실행. localhost:4173. 확장자 없는 페이지 경로는 Cloudflare와 처리 방식이 다를 수 있다.
- Git 이력과 기존 로컬 라이선스 수정은 보존했다. 사용자 원격 저장소는 Spiderenity/Portfolio.

기존 배포 설정 기록: Cloudflare Pages, main 브랜치, Framework None, Build command `exit 0`, Output `dist`, Root 저장소 루트.
현재 원격 설정을 이번에 다시 확인한 것은 아니다. 배포 요청 없이 푸시하지 않는다.

## 정리 결과와 유지보수 자료

사용하지 않는 character-acting 영상·썸네일·하이라이트, 컷인 상세에서 사용하지 않는 하이라이트 4개,
이전 일러스트 중간본 6개와 옛 우표 2개, qa/v01의 초기 사이트와 검토용 이미지들을 삭제했다.
현재 카드가 사용하는 하이라이트 7개와 모든 현행 작품의 전체 영상·썸네일은 보존했다.

현재 유지보수 도구는 `tools/`에 모았다. 사이트 루트에서 다음을 실행한다.

- `node tools/check-new-works.cjs`: 페이지별 작품 목록·동적 미디어·컷인 전환·정리 동작·용량 제한.
- `node tools/test-email-wall.cjs`: 현재 Matter.js 이메일 글자와 충돌 경계·드래그 스트레스 검사.
- `node tools/test-sticker-gesture.cjs`: 모바일 스크롤과 길게 눌러 벗기기 동작 분리.
- `node tools/test-range.mjs`: Worker 영상 범위 응답.

Node.js 기본 모듈과 현재 dist/vendor만 사용한다. 브라우저 자동 조작이나 이미지 출력을 하지 않는다.
`preview.mjs`는 로컬 확인용으로 보존했다.

초기 미디어 일괄 변환·구 테마 스티커 제작 스크립트, 오래된 Canvas 시연·중복 테스트,
qa의 나머지 구 검토 영상·외부 참고 페이지·로컬 FFmpeg 패키지, 미사용 Sites 등록을 삭제했다.
현재 미디어를 갱신할 때는 원본과 원하는 썸네일·하이라이트 구간을 먼저 확정하고 해당 파일만 제작한다.
삭제한 초기 일괄 변환기를 재실행하거나 과거 선정값을 현재 정답으로 가정하지 않는다.

`tools/media.json`과 `media-selection.json`은 원본 대응·당시 선정값 참고 자료다.
`tools/cleanup-20261114.json`, `cleanup-tools-20261114.json`은 이번 정리의 해시·삭제 목록이다.
이번 추가 정리에서 테스트 4개가 모두 통과했고 dist의 모든 파일 해시가 작업 전과 일치했다.

이번 검증: JavaScript 문법, 현재 동적 영상·썸네일 경로 29개, HTML/CSS 파일 참조와 Range 처리 검사 통과.
현재 유지한 미디어는 변경 전 해시와 같다. 화면 자동화·렌더·영상 재인코딩·배포는 수행하지 않았다.
