# MiriTranslator

크롬 기본 번역 기능과 같은 UX로 웹페이지를 번역하는 유저스크립트입니다.

**키가 필요 없는 무료 API 5종을 기본 지원**하고, 각 서비스의 공식 무료 티어 API 키도 입력할 수 있습니다.

---

## 설치

1. 유저스크립트 매니저를 설치합니다
   - [Tampermonkey](https://www.tampermonkey.net/) (Chrome / Edge / Firefox / Android)
   - [Violentmonkey](https://violentmonkey.github.io/)
   - [GreaseMonkey](https://www.greasespot.net/)
2. `miri-translate.user.js`를 설치합니다
   - 이 저장소의 `miri-translate.user.js` 파일을 Tampermonkey로 드래그하거나 열어 설치
   - 또는 설치 화면에서 **새 스크립트**를 만들고 파일 내용을 붙여넣기
3. 아무 웹페이지나 열고 우측 하단 버튼을 누릅니다

> **Tampermonkey / Violentmonkey를 권장합니다.**
> 파파고·DeepL처럼 CORS 응답 헤더가 없는 서버는 브라우저의 `fetch`로는 호출할 수 없습니다.
> 유저스크립트 매니저의 `GM_xmlhttpRequest`는 이 제약을 우회합니다.
> 매니저 없이 `fetch` 폴백만 동작하는 환경에서는 CORS를 허용하는 **Google 번역 · MyMemory · Reverso**만 사용됩니다.

---

## 번역 엔진

### 키가 필요 없는 엔진 (기본값)

| 엔진 | 품질 | 비고 |
| --- | --- | --- |
| **Google 번역** | ★★★★★ | 기본값. 언어 100개 이상, 가장 빠름 |
| **파파고** | ★★★★★ | 한국어 최적화. 네이버 N2MT 엔진 |
| **DeepL** | ★★★★★ | 최고 품질. 단, 일부 IP 대역은 요청이 제한될 수 있음 |
| **MyMemory** | ★★★☆ | 백업용. 구문당 500자 제한, 일일 사용량 있음 |
| **Reverso** | ★★★☆ | 백업용 (Lingvanex). 짧은 문장에만 안정적 |

> 이 다섯 개는 **공식 키 발급 절차 없이** 동작합니다.
> 개인 브라우저에서 쓰는 공개 엔드포인트를 호출하므로, 서비스 정책 변경이나 트래픽 증가 시
> 일시적으로 제한될 수 있습니다. 자동 모드에서는 실패 시 다음 엔진으로 자동 전환합니다.

### 무료 티어 키를 넣으면 쓸 수 있는 엔진

| 엔진 | 무료 한도 | 키 발급 |
| --- | --- | --- |
| DeepL API Free | 월 50만 자 | [deepl.com/pro-api](https://www.deepl.com/pro-api) |
| Microsoft Translator | 월 200만 자 | [azure.microsoft.com](https://azure.microsoft.com/products/ai-services/cognitive-services/translator) — `global` 리전 사용 |
| Papago N2MT (Naver Cloud) | 월 100만 자 | [ncloud-docs.com](https://guide.ncloud-docs.com/docs/en/papagotranslation-api) — Client ID / Secret |
| Google Cloud Translation | 월 50만 자 | [cloud.google.com/translate](https://cloud.google.com/translate) — 과금 계정 연결 필요 |
| LibreTranslate | 인스턴스별 | 직접 호스팅 또는 `libretranslate.com` API Key |
| 사용자 정의 엔드포인트 | — | 임의의 JSON API (필드명 지정 가능) |

키는 **설정** 화면에 입력하고 **저장**하면 브라우저 확장 저장소(GM storage)에만 보관됩니다.

---

## 기능

### 크롬 스타일 UI

- 우측 하단 **원형 버튼** → 언어 선택 → **번역** (크롬 번역 말풍선과 같은 배치)
- 언어 선택기는 검색창 + 国旗 + 로마자/현지어 이름, 창 높이에 부족하면 **위로 뒤집혀** 열립니다
- 번역 중에는 버튼 테두리에 **진행 링**, 말풍선 안에 **진행 바**
- 번역이 끝나면 원본 언어 표시, **원문 보기**, **복사**, 사용된 **엔진 이름** 표시
- 라이트 / 다크 / 시스템 테마, 키보드 접근성(`aria-*`, 포커스 링) 지원

### 표시 방식 3가지

| 모드 | 설명 |
| --- | --- |
| **원문 대체** | 원문을 번역문으로 교체 (크롬 기본 동작) |
| **원문 아래 표시** | 원문 위에 번역문을 흐린 색으로 덧붙임 |
| **원문 숨김** | 번역문만 표시 |

세 모드 모두 **원문으로 되돌리기**가 동작하며, 되돌린 뒤의 HTML은 원본과 바이트 단위로 동일합니다.

### 번역 품질을 위한 처리

- 문단을 **가장 가까운 블록 요소 단위로 묶어** 한 번에 번역 → 요청 수를 크게 줄임
  (예제 문서 기준 35회 → **2회** 요청, 2.2초 → **0.4초**)
- 블록 내 여러 텍스트 노드는 `줄바꿈`으로 이어 붙이고, 응답의 줄 수가 정확히 맞을 때만
  매핑을 적용합니다. 줄 수가 어긋나면 자동으로 개별 요청으로 재시도해 오배치를 원천 차단합니다.
- 같은 문장은 페이지 전체에서 한 번만 번역(중복 요청 제거)
- `pre`, `code`, `kbd` 등 기계어 요소, `.notranslate`, `translate="no"`, `contenteditable` 영역은 제외
- `script`, `style`, `svg`, `math`, `iframe`, 입력 요소 등은 건너뜀
- 번역 후에도 **MutationObserver**로 새로 생긴 콘텐츠를 이어서 번역

### 그 외

- **드래그 번역**: 문장을 드래그하면 버튼이 떠서 선택 부분만 번역
- **자동 번역**: 켜면 모든 페이지를 방문할 때마다 자동 번역, 사이트별 예외 지정 가능
- **제목 번역**: `document.title` 도 함께 번역
- **iframe** 지원: 상위 프레임의 번역 명령을 내부 프레임이 함께 처리
- **단축키**: `Alt+T` 팝업, `Alt+R` 번역/되돌리기, `Alt+S` 설정, `Esc` 닫기
- 유저스크립트 매니저 메뉴에서도 실행 가능

---

## 모바일

데스크톱과 같은 코드로 동작하며, 화면 크기에 따라 자동으로 바뀝니다.

- 버튼 크기 54px → **48px**, 세로 화면에서는 우측 하단(안전 영역 고려)에 배치
- 말풍선이 **하단 시트**로 전환되고, 상단 핸들로 **아래로 쓸어 닫기** 지원
- 언어 선택기가 시트 전체를 덮는 **전체 화면 선택기**로 전환
- 모든 터치 요소 최소 **44px**, `:hover` 의존 없음
- `env(safe-area-inset-*)`로 노치·홈 인디케이터 영역 회피

---

## 설정 항목

번역 언어 / 원본 언어 / 번역 엔진 / API 키 / 표시 방식 / 자동 번역 / 드래그 번역 /
버튼 표시 / 코드 블록 제외 / 번역 제외 CSS 선택자 / 테마 / 기본값 복원

번역 제외 선택자는 쉼표로 구분합니다.

```css
.ads, #comments, [data-no-translate]
```

---

## 개발

```
src/                 소스 (여러 모듈)
  00-meta.js         유저스크립트 메타데이터
  10-utils.js        유틸리티
  20-langs.js        언어 테이블
  30-net.js          HTTP 계층 (GM_xmlhttpRequest / fetch 폴백)
  40-engines.js      번역 엔진 11종
  50-store.js        설정 저장소
  60-dom.js          DOM 번역 엔진 (수집 / 적용 / 되돌리기)
  70-service.js      스케줄링 · 중복 제거 · 엔진 자동 전환
  80-ui-css.js       스타일
  85-ui.js           UI (Shadow DOM)
  90-main.js         배선 · 단축키 · iframe · 메뉴
test/
  harness.html       Tampermonkey 동작을 흉내내는 로컬 테스트 페이지
  fixture.html       번역 테스트용 영문 문서
  mobile.html        390px / 320px 뷰포트 확인용
  server.mjs         정적 서버 + GM_xmlhttpRequest 대역 프록시
miri-translate.user.js   빌드 결과물 (이 파일을 설치)
```

```bash
node build.mjs          # src/ → miri-translate.user.js
node test/server.mjs    # http://localhost:8123/test/harness.html
```

`build.mjs`는 CSS가 들어 있는 템플릿 리터럴의 백틱 균형과 CSS 주석 안의
템플릿 문법을 검사하므로, 실수로 CSS가 잘리는 문제가 빌드 단계에서 차단됩니다.

---

## 알아두기

- 이 스크립트는 각 번역 서비스의 **웹 공개 엔드포인트**를 사용합니다.
  공식 API가 아니므로 서비스 정책 변경 시 동작이 달라질 수 있습니다.
- 페이지 본문은 **사용자가 선택한 번역 서비스로만** 전송됩니다. 그 외로 갈 곳은 없습니다.
- 스크립트는 MIT 라이선스로 배포됩니다.

## 라이선스

MIT — [LICENSE](LICENSE)