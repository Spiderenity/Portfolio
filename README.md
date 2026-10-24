# 황서영 포트폴리오

2D 애니메이션·모션그래픽을 중심으로 한 정적 웹사이트. 원본은 `../포트폴리오/`에 보존하며 사이트는 `dist/`의 웹용 사본만 사용합니다.

## 구성

- Motion: 영상 4개, GIF에서 변환한 반복 영상 1개. 마우스 오버 시 무음 미리보기, 선택하면 전체 영상을 재생합니다.
- Illustration: 이미지 6개. 이미지 비율을 유지하며 확대해서 볼 수 있습니다.
- Other: 하루하나 공개 링크, LINK 디스코드 추가 링크, 미디펫의 미배포 표시.
- 연락처: shalespire@naver.com

## 수정 위치

- `dist/app.js`: 영상 제목, 순서, 파일명. 작품별 `description` 속성을 추가하면 확대 화면에 설명이 표시됩니다.
- `dist/index.html`: 소개, 연락처, 코딩 작품, 탭별 작품 수.
- `dist/style.css`: 색상, 레이아웃, 모바일 대응.
- `dist/assets/`: 웹용 영상, 썸네일, 이미지.
- `.openai/hosting.json`: 미사용 Sites 등록 기록. GitHub 업로드에서 제외합니다.

작품의 담당 범위, 도구, 제작 연도는 확인되지 않아 표기하지 않았습니다. 일러스트레이션 제목은 임시 번호이며 실제 제목으로 교체할 수 있습니다. GIF 웹용 사본은 MP4로 변환되어 투명도를 유지하지 않습니다. 원본 GIF는 변경하지 않았습니다.

`node preview.mjs`로 로컬 미리보기를 시작할 수 있습니다. 주소는 `http://127.0.0.1:4173`입니다.

## GitHub 및 Cloudflare Pages

사용자가 지정한 GitHub 계정은 Spiderenity입니다. 저장소 생성 및 업로드는 해당 계정의 쓰기 권한을 확인한 뒤 진행합니다. Cloudflare Pages에서 GitHub 저장소를 연결하고 다음 값을 설정합니다.

- Framework preset: None
- Production branch: main
- Build command: exit 0
- Build output directory: dist
- Root directory: 저장소 루트

공식 안내: https://developers.cloudflare.com/pages/framework-guides/deploy-anything/

작품 전체 원본, qa 디렉터리, 미사용 Sites 설정은 업로드 대상이 아닙니다. 배포 대상은 dist의 웹용 파일입니다. 현재 디자인은 MOSTAPES의 공개 구조를 참고한 수정 시안이며 최종 승인본이 아닙니다.

화면/마우스/키보드 자동화 금지 지침에 따라 브라우저 자동 조작 테스트는 수행하지 않았습니다. 파일 참조, JavaScript 문법, 영상 디코딩을 명령행으로 확인합니다.

## 현재 디자인

- 표기: 황서영 / Hwang Seoyeong
- 폰트: 보유 Gmarket Sans Bold와 Paperlogy Regular 파일. 라이선스는 dist/fonts에 포함.
- 일러스트 1·2·3·5는 내부 구멍을 메운 스티커, 4·6은 우표 테두리. 7·8은 제외.
- Canvas로 실제 알파 외곽을 접으며, 포인터가 벗어나면 원래 실루엣으로 복귀. 모션 감소 설정에서는 효과 생략.
- 헤더 고정, 본문만 스크롤. 스크롤바 공간을 미리 확보.
- 하루하나: AI 채팅 데스크톱 펫 / LINK: 디스코드 봇 게임 / 미디펫: MIDI 데스크톱 펫.

GitHub: https://github.com/Spiderenity/Portfolio
