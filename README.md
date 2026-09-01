# HWIJAE XP — 마케팅 포트폴리오

워커스하이에서 수행한 플래그샵 마케팅 업무를 Windows XP 탐색기 구조로 정리한 정적 웹 포트폴리오입니다. 별도 빌드 도구나 프레임워크 없이 HTML, CSS, JavaScript만 사용합니다.

- 공개 사이트: <https://lhj94.github.io/hwijae-xp-portfolio/>
- GitHub 저장소: <https://github.com/LHJ94/hwijae-xp-portfolio>

## 로컬 실행

파일을 직접 열면 JSON 데이터를 읽지 못하므로 프로젝트 폴더에서 HTTP 서버를 실행합니다.

```bash
cd "/Users/hwijae/Documents/New project/workershigh-xp-portfolio-web"
python3 -m http.server 4173
```

브라우저에서 `http://localhost:4173`을 엽니다.

## 콘텐츠 수정 위치

- 공개 대표 프로젝트: `data/portfolio-public.json`
- 공개 2024–2025 업무: `data/legacy-public-2024-2025.json`
- 비공개 원본 데이터: `data/portfolio-dataset.json`, `data/legacy-2024-2025.json` (`.gitignore` 적용)
- 대표 사례 선택: `app.js`의 `CASE_PROJECT_IDS`
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
- 대표 프로젝트 6건과 프로젝트 상세
- 2024년 41개·2025년 212개 원본 업무 인덱스
- 연도, 상태, 검색 필터
- 창 열기·닫기·최소화·최대화, 시작 메뉴, 종료·재시작
- 모바일 반응형과 키보드 포커스

라이선스와 참고 자료는 `ATTRIBUTIONS.md`를 확인하세요.
