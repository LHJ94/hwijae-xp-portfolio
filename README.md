# HWIJAE XP — 마케팅 포트폴리오

플래그샵을 중심으로 이휘재의 2019–2026 마케팅 경력을 Windows XP 탐색기 구조로 정리한 정적 웹 포트폴리오입니다. 개별 업무가 아니라 8개 역량 폴더를 중심으로 탐색하며, 별도 빌드 도구나 프레임워크 없이 HTML, CSS, JavaScript만 사용합니다.

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
- 공개 2024–2025 업무: `data/legacy-public-2024-2025.json`
- 공개 경력·역량 폴더: `data/career-public.json`
- 비공개 원본 데이터: `data/portfolio-dataset.json`, `data/legacy-2024-2025.json` (`.gitignore` 적용)
- 역량 폴더와 이전 경력: `data/career-public.json`
- 역량 폴더에 연결되는 세부 사례: `app.js`의 `renderCapability()`
- AI 성과 대시보드 가데이터: `app.js`의 `DASHBOARD_DEMO`
- 연락처: `app.js`의 `renderContact()`
- 프로젝트 이미지·문서: `app.js`의 `renderProject()` 안 `media-slots` 영역을 실제 파일 또는 링크로 교체
- 화면 스타일: `styles.css`

원본 데이터가 바뀌면 아래 명령으로 개인정보와 내부 시트 위치가 제거된 공개용 JSON을 다시 생성합니다.

```bash
python3 scripts/build_public_data.py
```

## GitHub Pages 배포

1. 이 폴더를 별도 공개 GitHub 저장소에 올립니다.
2. 저장소의 **Settings → Pages**에서 배포 소스를 `Deploy from a branch`로 선택합니다.
3. `main` 브랜치와 `/ (root)`를 선택한 뒤 저장합니다.

정적 상대 경로만 사용하므로 별도 빌드 설정 없이 동작합니다. 원본 데이터 파일 2개는 공개 저장소에 커밋하지 않으며, 공개 전 연락처, 이미지, 외부 프로필 주소를 교체해야 합니다.

## 1차 구현 범위

- 부팅 화면, 로그인 화면, XP 데스크톱
- 8개 역량 폴더와 플래그샵에서 구축한 시스템 파일
- HOTELIV → 우리동네커머스 → Adriel → SparkPlus → FLAGSHOP 경력 타임라인
- 이전 경력 성과 지표와 플래그샵 대표 프로젝트 상세
- 2024년 41개·2025년 212개 원본 업무 인덱스
- 연도, 상태, 검색 필터
- 데스크톱 `Performance AI` 프로그램: 가데이터 KPI·추이·채널 비교·AI 요약·실행 제안과 7일/30일 전환
- 창 열기·닫기·최소화·최대화, 시작 메뉴, 종료·재시작
- 모바일 반응형과 키보드 포커스

`Performance AI`는 포트폴리오용 가상 데모입니다. 실제 GA4·네이버 광고·Meta 광고 계정, API, 데이터베이스 또는 원본 대시보드의 환경 변수와 연결되지 않습니다.

라이선스와 참고 자료는 `ATTRIBUTIONS.md`를 확인하세요.
