# HWIJAE XP — 마케팅 포트폴리오

플래그샵을 중심으로 이휘재의 마케팅 경력을 Windows XP 프로그램으로 탐색하는 채용용 포트폴리오입니다. 30초 소개 → 대표 경험 → 역량별 프로그램 → 경력·연락 순서로 안내합니다. 별도 빌드 도구나 프레임워크 없이 HTML, CSS, JavaScript만 사용합니다.

## 2026-09-21 개선

- 기획 의도·프로필·짧은 부팅 → 사용자 선택 → 채용용 소개 화면
- 내 소개, 브랜드 스튜디오, Performance AI, SEO Explorer, PR 뉴스룸, 현장 사진첩, 콘텐츠 메일함, Growth & Ops
- Work/Experience Archive는 주요 화면에서 제외. 기존 데이터와 코드는 보존하며 초기 로드 대상에서 제외
- 브라우저 뒤로 가기와 `#dashboard`, `#seo`, `#gallery` 등 직접 링크
- 기사·사진·검색 결과·연락처는 원본 등록 전 상태를 명시. 성과와 실제 매체 연결을 가상으로 꾸미지 않음
- 부팅과 프로그램 열기 효과음은 자체 Web Audio 톤이며 기본 음소거. 레퍼런스 음원을 복제·핫링크하지 않음
- 모바일 전체 화면 창, 키보드 포커스, 모션 감소 설정 지원. CRT 줄무늬는 가독성을 위해 제거

- 공개 사이트: <https://lhj94.github.io/hwijae-xp-portfolio/>
- GitHub 저장소: <https://github.com/LHJ94/hwijae-xp-portfolio>

## 로컬 실행

파일을 직접 열면 JSON 데이터를 읽지 못하므로 프로젝트 폴더에서 HTTP 서버를 실행합니다.

```bash
cd workershigh-xp-portfolio-web
python3 -m http.server 4173
```

브라우저에서 `http://localhost:4173`을 엽니다.

## 콘텐츠 수정 위치

- 공개 대표 프로젝트: `data/portfolio-public.json`
- 보존용 공개 2024–2025 업무: `data/legacy-public-2024-2025.json`
- 보존용 경험 서사·연결 규칙: `data/work-archive-public.json`
- 공개 경력·역량 폴더: `data/career-public.json`
- 비공개 원본 데이터: `data/portfolio-dataset.json`, `data/legacy-2024-2025.json` (`.gitignore` 적용)
- 역량 폴더와 이전 경력: `data/career-public.json`
- 역량 폴더에 연결되는 세부 사례: `app.js`의 `renderCapability()`
- 프로그램 화면·동작: `programs.js`
- AI 성과 대시보드 가데이터·계산: `demo-data.js`
- 프로필·기사·사진·SEO 캡처·콘텐츠·연락처: `data/evidence-public.json`
- 프로젝트 이미지·문서: `app.js`의 `renderProject()` 안 `media-slots` 영역을 실제 파일 또는 링크로 교체
- 기존 화면 스타일: `styles.css`, 프로그램별 스타일: `programs.css`

### 나중에 자료 넣기

`data/evidence-public.json`만 수정하면 됩니다. 이미지는 `assets/` 하위에 추가하고 해당 상대경로를 입력합니다. 아래는 필드 형식이며 실제 기사나 증거로 자동 등록되지 않습니다.

- `profilePhoto`: 프로필 사진 경로 또는 `null`. 부팅·로그인·소개에 공통 반영
- `contact`: `email`, `resume`(PDF URL/경로), `profile`(공개 프로필 URL). 없는 링크는 표시하지 않음
- `seo[]`: `query`, `label`, `intent`, `actions`, `screenshot`, `capturedAt`, `url`. 캡처와 확인일이 모두 있을 때 실제 검색 증거를 표시
- `articles[]`: `{ "title": "실제 제목", "date": "YYYY-MM-DD", "outlet": "매체명", "contribution": "본인 역할", "featured": true, "url": "https://실제-기사-주소" }`. 주요 기사만 원문 링크를 표시
- `albums[].photos[]`: `{ "src": "assets/행사사진.jpg", "alt": "사진 설명", "caption": "본인이 담당한 내용" }`
- `content[]`: 기존 `title`, `summary`, `steps`에 `image`, `url` 추가

기사 URL·고객 정보·성과 수치와 이미지 공개 범위를 확인하고 등록합니다. 증거 자료가 없는 상태에서 검색 순위나 KPI를 실제 성과로 표기하지 않습니다.

### Performance AI의 데이터 기준

- 가상 B2B 기업의 월 계획 예산 120,000,000원, 8개 채널
- 2026-08-31 기준 고정 일별 데이터. 7/30/90일 및 각각의 직전 기간 비교를 위해 180일(1,440행) 생성
- 문의는 CRM의 단일 채널 귀속을 가정. 플랫폼별 중복 전환을 단순 합산하지 않음
- CPL = 광고비 ÷ 문의, CTR = 클릭 ÷ 노출, CVR = 문의 ÷ 클릭
- AI 제안은 집계값과 규칙으로 생성한 시연. 외부 AI/API 호출 없음
- Growth & Ops 리드 시트는 별도의 가상 기업 16개 표본이며 대시보드 전체 리드 목록이 아님
- 등록한 실행 작업은 현재 페이지 세션의 메모리에만 유지. 새로고침하면 초기화

### 검증

Node 24 기준, 추가 패키지 설치 없이 실행합니다.

```bash
node --check app.js
node --check programs.js
node --check demo-data.js
node scripts/verify.mjs
git diff --check
```

2026-09-21: 데이터 1,440행·27개 기간/채널 조합·퍼널 정합성 검사 통과. Chrome의 데스크톱/모바일에서 8개 프로그램, 캠페인 상세, 필터, AI→Ops, API 시연, 최소화/복원, 브라우저 뒤로 가기 검증. 페이지 오류 0건.

원본 데이터가 바뀌면 아래 명령으로 개인정보와 내부 시트 위치가 제거된 공개용 JSON을 다시 생성합니다.

```bash
python3 scripts/build_public_data.py
```

## GitHub Pages 배포

1. 이 폴더를 별도 공개 GitHub 저장소에 올립니다.
2. 저장소의 **Settings → Pages**에서 배포 소스를 `Deploy from a branch`로 선택합니다.
3. `main` 브랜치와 `/ (root)`를 선택한 뒤 저장합니다.

정적 상대 경로만 사용하므로 별도 빌드 설정 없이 동작합니다. 원본 데이터 파일 2개는 공개 저장소에 커밋하지 않으며, 공개 전 연락처, 이미지, 외부 프로필 주소를 교체해야 합니다.

## 이전 버전 구현 이력

- 부팅 화면, 로그인 화면, XP 데스크톱
- 8개 역량 폴더와 플래그샵에서 구축한 시스템 파일
- HOTELIV → 우리동네커머스 → Adriel → SparkPlus → FLAGSHOP 경력 타임라인
- 이전 경력 성과 지표와 플래그샵 대표 프로젝트 상세
- 2024년 41개·2025년 212개 실행 기록을 9개 대표 경험의 의도·목표·과정·결과에 연결한 Experience Archive
- 경험별 연결 업무의 연도·상태·검색 필터
- 데스크톱 `Performance AI` 프로그램: 가데이터 KPI·추이·채널 비교·AI 요약·실행 제안과 7일/30일 전환
- 창 열기·닫기·최소화·최대화, 시작 메뉴, 종료·재시작
- 모바일 반응형과 키보드 포커스

`Performance AI`는 포트폴리오용 가상 데모입니다. 실제 GA4·네이버 광고·Meta 광고 계정, API, 데이터베이스 또는 원본 대시보드의 환경 변수와 연결되지 않습니다.

라이선스와 참고 자료는 `ATTRIBUTIONS.md`를 확인하세요.
