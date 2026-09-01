const CASE_PROJECT_IDS = [
  "flagshop-rebranding",
  "website-renewal",
  "technical-seo-and-search-visibility",
  "search-advertising",
  "always-on-pr-program",
  "people-and-culture-expo-2026",
];

const elements = {
  bootScreen: document.getElementById("bootScreen"),
  bootButton: document.getElementById("bootButton"),
  bootProgress: document.getElementById("bootProgress"),
  loginScreen: document.getElementById("loginScreen"),
  loginButton: document.getElementById("loginButton"),
  desktop: document.getElementById("desktop"),
  portfolioWindow: document.getElementById("portfolioWindow"),
  portfolioTask: document.getElementById("portfolioTask"),
  mainContent: document.getElementById("mainContent"),
  windowTitle: document.getElementById("windowTitle"),
  addressOutput: document.getElementById("addressOutput"),
  statusText: document.getElementById("statusText"),
  backButton: document.getElementById("backButton"),
  minimizeButton: document.getElementById("minimizeButton"),
  maximizeButton: document.getElementById("maximizeButton"),
  closeButton: document.getElementById("closeButton"),
  startButton: document.getElementById("startButton"),
  startMenu: document.getElementById("startMenu"),
  shutdownButton: document.getElementById("shutdownButton"),
  shutdownScreen: document.getElementById("shutdownScreen"),
  restartButton: document.getElementById("restartButton"),
  welcomeToast: document.getElementById("welcomeToast"),
  toastClose: document.getElementById("toastClose"),
  clock: document.getElementById("clock"),
};

const state = {
  dataset: null,
  legacy: null,
  booting: false,
  route: { type: "home" },
  history: [],
  archive: {
    year: "2025",
    status: "all",
    query: "",
    limit: 40,
  },
  dashboardRange: "30",
};

const DASHBOARD_DEMO = {
  "7": {
    period: "최근 7일",
    comparison: "직전 7일 대비",
    kpis: [
      { label: "광고비", value: "₩826K", change: "8.4% ↓", tone: "positive", source: "Naver + Meta" },
      { label: "웹 세션", value: "2,110", change: "12.1% ↑", tone: "positive", source: "GA4" },
      { label: "문의 리드", value: "11", change: "2건 ↑", tone: "positive", source: "GA4 Event" },
      { label: "추정 CPA", value: "₩75K", change: "18.6% ↓", tone: "positive", source: "Combined" },
    ],
    trend: [42, 58, 51, 74, 68, 86, 94],
    channels: [
      ["Naver Search", "₩492K", "1,240", "8", "₩61K"],
      ["Meta Ads", "₩334K", "620", "3", "₩111K"],
      ["Organic Search", "—", "250", "2", "—"],
    ],
    insightSummary: "검색 광고의 전환 효율이 개선됐습니다. 다음 주 예산 증액보다 고의도 키워드 확장이 우선입니다.",
  },
  "30": {
    period: "최근 30일",
    comparison: "직전 30일 대비",
    kpis: [
      { label: "광고비", value: "₩3.48M", change: "4.2% ↑", tone: "neutral", source: "Naver + Meta" },
      { label: "웹 세션", value: "8,420", change: "16.8% ↑", tone: "positive", source: "GA4" },
      { label: "문의 리드", value: "37", change: "9건 ↑", tone: "positive", source: "GA4 Event" },
      { label: "추정 CPA", value: "₩94K", change: "11.3% ↓", tone: "positive", source: "Combined" },
    ],
    trend: [40, 47, 44, 58, 55, 63, 61, 72, 68, 79, 76, 88],
    channels: [
      ["Naver Search", "₩2.06M", "4,380", "24", "₩86K"],
      ["Meta Ads", "₩1.42M", "2,710", "13", "₩109K"],
      ["Organic Search", "—", "1,330", "8", "—"],
    ],
    insightSummary: "브랜드 검색과 고의도 키워드가 리드 증가를 견인했습니다. Meta 소재는 피로도 신호가 있어 교체가 필요합니다.",
  },
};

initialize();

async function initialize() {
  bindEvents();
  updateClock();
  window.setInterval(updateClock, 30_000);

  try {
    const [datasetResponse, legacyResponse] = await Promise.all([
      fetch("data/portfolio-public.json"),
      fetch("data/legacy-public-2024-2025.json"),
    ]);

    if (!datasetResponse.ok || !legacyResponse.ok) {
      throw new Error("포트폴리오 데이터 파일을 찾지 못했습니다.");
    }

    [state.dataset, state.legacy] = await Promise.all([
      datasetResponse.json(),
      legacyResponse.json(),
    ]);

    renderRoute();
  } catch (error) {
    renderDataError(error);
  }
}

function bindEvents() {
  elements.bootButton.addEventListener("click", startBootSequence);
  elements.loginButton.addEventListener("click", login);
  elements.backButton.addEventListener("click", navigateBack);
  elements.minimizeButton.addEventListener("click", minimizeWindow);
  elements.maximizeButton.addEventListener("click", toggleMaximize);
  elements.closeButton.addEventListener("click", closeWindow);
  elements.portfolioTask.addEventListener("click", toggleTaskWindow);
  elements.startButton.addEventListener("click", toggleStartMenu);
  elements.shutdownButton.addEventListener("click", shutdown);
  elements.restartButton.addEventListener("click", restart);
  elements.toastClose.addEventListener("click", () => elements.welcomeToast.classList.add("is-hidden"));

  document.addEventListener("click", handleGlobalClick);
  document.addEventListener("keydown", handleGlobalKeydown);
  elements.mainContent.addEventListener("click", handleContentClick);
  elements.mainContent.addEventListener("input", handleArchiveInput);
  elements.mainContent.addEventListener("change", handleArchiveChange);
}

function handleGlobalClick(event) {
  const openButton = event.target.closest("[data-open]");
  if (openButton) {
    openWindow(openButton.dataset.open);
    return;
  }

  const viewButton = event.target.closest("[data-view]");
  if (viewButton) {
    navigate({ type: viewButton.dataset.view });
  }

  if (!event.target.closest("#startMenu") && !event.target.closest("#startButton")) {
    closeStartMenu();
  }
}

function handleGlobalKeydown(event) {
  if (event.key !== "Enter") return;

  if (elements.bootScreen.classList.contains("is-active")) {
    startBootSequence();
  } else if (elements.loginScreen.classList.contains("is-active")) {
    login();
  }
}

function startBootSequence() {
  if (state.booting) return;

  state.booting = true;
  elements.bootButton.classList.add("is-loading");
  elements.bootProgress.classList.add("is-running");
  elements.bootProgress.setAttribute("aria-hidden", "false");

  window.setTimeout(() => {
    switchSystemScreen(elements.bootScreen, elements.loginScreen);
    state.booting = false;
  }, 1_150);
}

function login() {
  elements.loginScreen.classList.remove("is-active");
  elements.desktop.classList.add("is-active");
  window.setTimeout(() => openWindow("home"), 480);
}

function switchSystemScreen(from, to) {
  from.classList.remove("is-active");
  window.setTimeout(() => to.classList.add("is-active"), 280);
}

function openWindow(routeType = "home") {
  elements.portfolioWindow.classList.remove("is-hidden", "is-minimized");
  elements.portfolioTask.classList.remove("is-hidden");
  elements.portfolioTask.classList.add("is-active");
  closeStartMenu();
  navigate({ type: routeType });
}

function closeWindow() {
  elements.portfolioWindow.classList.add("is-hidden");
  elements.portfolioTask.classList.add("is-hidden");
  elements.portfolioTask.classList.remove("is-active");
}

function minimizeWindow() {
  elements.portfolioWindow.classList.add("is-minimized");
  elements.portfolioTask.classList.remove("is-active");
}

function toggleTaskWindow() {
  if (elements.portfolioWindow.classList.contains("is-hidden")) {
    openWindow(state.route.type);
    return;
  }

  const isMinimized = elements.portfolioWindow.classList.toggle("is-minimized");
  elements.portfolioTask.classList.toggle("is-active", !isMinimized);
}

function toggleMaximize() {
  const isMaximized = elements.portfolioWindow.classList.toggle("is-maximized");
  elements.maximizeButton.setAttribute("aria-label", isMaximized ? "Restore" : "Maximize");
}

function toggleStartMenu() {
  const isOpening = elements.startMenu.classList.contains("is-hidden");
  elements.startMenu.classList.toggle("is-hidden", !isOpening);
  elements.startButton.setAttribute("aria-expanded", String(isOpening));
}

function closeStartMenu() {
  elements.startMenu.classList.add("is-hidden");
  elements.startButton.setAttribute("aria-expanded", "false");
}

function shutdown() {
  closeStartMenu();
  elements.desktop.classList.remove("is-active");
  elements.shutdownScreen.classList.add("is-active");
}

function restart() {
  elements.shutdownScreen.classList.remove("is-active");
  elements.portfolioWindow.classList.add("is-hidden");
  elements.portfolioWindow.classList.remove("is-minimized", "is-maximized");
  elements.portfolioTask.classList.add("is-hidden");
  elements.welcomeToast.classList.remove("is-hidden");
  elements.bootButton.classList.remove("is-loading");
  elements.bootProgress.classList.remove("is-running");
  state.history = [];
  state.route = { type: "home" };
  window.setTimeout(() => elements.bootScreen.classList.add("is-active"), 260);
}

function navigate(route, options = {}) {
  const { replace = false } = options;
  const isSameRoute = route.type === state.route.type && route.id === state.route.id;

  if (!replace && !isSameRoute) {
    state.history.push({ ...state.route });
  }

  state.route = { ...route };
  renderRoute();
}

function navigateBack() {
  const previous = state.history.pop();
  if (!previous) return;
  state.route = previous;
  renderRoute();
}

function renderRoute() {
  elements.backButton.disabled = state.history.length === 0;
  updateSelectedNavigation();

  if (!state.dataset || !state.legacy) return;

  switch (state.route.type) {
    case "archive":
      renderArchive();
      updateWindowContext("Work Archive 2024–2025", "C:\\Portfolio\\Work Archive", "253개 업무 인덱스");
      break;
    case "dashboard":
      renderDashboard();
      updateWindowContext("FLAGSHOP Performance AI — Demo", "C:\\Portfolio\\Performance AI", "가데이터 · AI 분석 워크플로우 데모");
      break;
    case "about":
      renderAbout();
      updateWindowContext("About Me", "C:\\Portfolio\\About Me", "역할과 역량");
      break;
    case "contact":
      renderContact();
      updateWindowContext("Contact", "C:\\Portfolio\\Contact", "연락처 정보");
      break;
    case "project":
      renderProject(state.route.id);
      break;
    case "home":
    default:
      renderHome();
      updateWindowContext("이휘재 마케팅 포트폴리오", "C:\\Portfolio\\대표 사례", "6개 대표 사례 · 24개 프로젝트 클러스터");
      break;
  }

  elements.mainContent.scrollTop = 0;
}

function renderHome() {
  const projects = CASE_PROJECT_IDS.map((id) => getProject(id)).filter(Boolean);
  const taxonomy = state.dataset.taxonomy || [];

  elements.mainContent.innerHTML = `
    <article class="content-page portfolio-home">
      <header class="portfolio-hero">
        <div>
          <p class="page-kicker">Brand · Content · Growth Marketer</p>
          <h1 class="page-title">복잡한 마케팅 업무를<br />브랜드 경험으로 연결합니다.</h1>
          <p class="page-lead">
            워커스하이에서 서비스 브랜드 플래그샵의 리브랜딩, 웹사이트, SEO·광고,
            콘텐츠·PR, 행사 운영을 연결해 실행했습니다. 대표 사례는 의사결정과 기여 범위를 중심으로 정리했습니다.
          </p>
        </div>
        <div class="metric-strip" aria-label="포트폴리오 범위">
          <div><strong>6</strong><span>대표 사례</span></div>
          <div><strong>24</strong><span>프로젝트 클러스터</span></div>
          <div><strong>253</strong><span>2024–2025 업무 인덱스</span></div>
        </div>
      </header>

      <section aria-labelledby="caseHeading">
        <div class="section-heading">
          <h2 id="caseHeading">대표 프로젝트 폴더</h2>
          <p>폴더를 열어 문제·판단·실행·산출물을 확인하세요.</p>
        </div>
        <div class="project-grid">
          ${projects.map(projectFolderMarkup).join("")}
        </div>
      </section>

      <section aria-labelledby="capabilityHeading">
        <div class="section-heading">
          <h2 id="capabilityHeading">업무를 연결하는 8개 역량</h2>
          <p>개별 업무보다 연결된 운영 구조를 보여줍니다.</p>
        </div>
        <div class="competency-list">
          ${taxonomy.map((item) => `
            <article>
              <h3>${escapeHtml(item.label)}</h3>
              <p>${escapeHtml(item.description)}</p>
            </article>
          `).join("")}
        </div>
      </section>
    </article>
  `;
}

function projectFolderMarkup(project, index) {
  const categories = project.category_ids.map(categoryLabel).filter(Boolean).join(" · ");
  return `
    <button class="project-folder" type="button" data-project="${escapeHtml(project.id)}">
      <img src="assets/folder.png" alt="" />
      <span>
        <strong>${String(index + 1).padStart(2, "0")}_${escapeHtml(project.title)}.folder</strong>
        <small>${escapeHtml(categories)} · ${escapeHtml(project.period)}</small>
      </span>
      <span class="folder-arrow" aria-hidden="true">›</span>
    </button>
  `;
}

function renderProject(projectId) {
  const project = getProject(projectId);
  if (!project) {
    renderDataError(new Error("프로젝트를 찾지 못했습니다."));
    return;
  }

  const categories = project.category_ids.map(categoryLabel).filter(Boolean).join(" · ");
  const resultNotes = project.result_evidence || [];
  const evidenceSlots = (project.needed_to_publish || []).slice(0, 2);

  while (evidenceSlots.length < 2) {
    evidenceSlots.push("공개 가능한 프로젝트 근거 자료");
  }

  elements.mainContent.innerHTML = `
    <article class="content-page project-detail">
      <div class="detail-topline">
        <button class="back-link" type="button" data-back>← 대표 프로젝트</button>
        <span class="detail-period">${escapeHtml(project.period)} · ${escapeHtml(project.portfolio_tier)}</span>
      </div>

      <header>
        <p class="page-kicker">${escapeHtml(categories)}</p>
        <h1 class="page-title">${escapeHtml(project.title)}</h1>
        <p class="detail-objective">${escapeHtml(project.objective)}</p>
      </header>

      <div class="detail-grid">
        <div>
          <section class="detail-section">
            <h2>본인 기여와 실행</h2>
            <ul>${listMarkup(project.documented_contributions)}</ul>
          </section>
          <section class="detail-section">
            <h2>문서화된 산출물</h2>
            <div class="output-list">
              ${(project.documented_outputs || []).map((item) => `<span>${escapeHtml(item)}</span>`).join("")}
            </div>
          </section>
          ${resultNotes.length ? `
            <section class="detail-section">
              <h2>성과 표현 전 검증 메모</h2>
              <ul>${listMarkup(resultNotes)}</ul>
            </section>
          ` : ""}
        </div>

        <aside class="detail-aside">
          <h2>이 사례가 보여주는 것</h2>
          <p>${escapeHtml(project.case_study_angle)}</p>
          <h2>공개 전 확보할 근거</h2>
          <ul class="evidence-list">${listMarkup(project.needed_to_publish)}</ul>
        </aside>
      </div>

      <section class="media-slots" aria-label="수동 이미지 삽입 영역">
        ${evidenceSlots.map((slot, index) => `
          <div class="media-slot">
            <strong>이미지·문서 삽입 영역 ${index + 1}</strong>
            <span>${escapeHtml(slot)}</span>
          </div>
        `).join("")}
      </section>
    </article>
  `;

  updateWindowContext(project.title, `C:\\Portfolio\\대표 사례\\${project.id}.case`, `${project.documented_outputs.length}개 산출물 · 근거 자료 수동 삽입 예정`);
}

function renderArchive() {
  const yearData = state.legacy.yearly_work_index[state.archive.year];
  const records = yearData?.records || [];
  const filtered = filterArchiveRecords(records);
  const visible = filtered.slice(0, state.archive.limit);

  elements.mainContent.innerHTML = `
    <article class="content-page archive-page">
      <header class="archive-header">
        <div>
          <p class="page-kicker">Original Work Index</p>
          <h1 class="page-title">2024–2025 Work Archive</h1>
          <p class="page-lead">
            24개 프로젝트로 압축되기 전의 고유 업무 제목을 원본 상태와 시트 위치까지 보존했습니다.
            공개 화면에서는 개인정보와 내부 시트 위치를 제외했으며, 업무 수를 성과 수치로 해석하지 않습니다.
          </p>
        </div>
        <div class="archive-counts" aria-label="연도별 인덱스 수">
          <div><strong>41</strong><span>2024 완료·진행</span></div>
          <div><strong>212</strong><span>2025 완료·진행</span></div>
        </div>
      </header>

      <div class="archive-controls">
        <div class="year-switch" aria-label="연도 선택">
          ${["2024", "2025"].map((year) => `
            <button type="button" data-archive-year="${year}" class="${state.archive.year === year ? "is-active" : ""}">${year}</button>
          `).join("")}
        </div>
        <label class="field-label">
          업무 검색
          <input id="archiveSearch" type="search" value="${escapeHtml(state.archive.query)}" placeholder="제목·분류·원본 위치 검색" />
        </label>
        <label class="field-label">
          원본 상태
          <select id="archiveStatus">
            <option value="all" ${state.archive.status === "all" ? "selected" : ""}>전체</option>
            <option value="complete" ${state.archive.status === "complete" ? "selected" : ""}>완료 포함</option>
            <option value="active" ${state.archive.status === "active" ? "selected" : ""}>진행 포함</option>
          </select>
        </label>
      </div>

      <div class="archive-summary">
        <span>${state.archive.year}년 ${filtered.length}개 검색 결과</span>
        <span>원본 고유 제목 ${yearData.unique_titles}개 중 ${yearData.indexed_titles}개 · 공개용 정제본</span>
      </div>

      <div class="archive-list" aria-label="업무 인덱스">
        <div class="archive-row archive-table-head" aria-hidden="true">
          <span>연도</span><span>업무 제목</span><span>상태·분류</span>
        </div>
        ${visible.length ? visible.map(archiveRowMarkup).join("") : `<p class="empty-state">검색 조건과 일치하는 업무가 없습니다.</p>`}
      </div>
      ${filtered.length > visible.length ? `<button class="archive-more" type="button" data-show-more>업무 더 보기 (${filtered.length - visible.length})</button>` : ""}
    </article>
  `;
}

function renderDashboard() {
  const demo = DASHBOARD_DEMO[state.dashboardRange];
  const chartPoints = demo.trend
    .map((value, index) => {
      const x = 8 + (index / Math.max(demo.trend.length - 1, 1)) * 84;
      const y = 78 - ((value - 35) / 65) * 58;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  elements.mainContent.innerHTML = `
    <article class="content-page ai-dashboard-page">
      <header class="ai-dashboard-header">
        <div>
          <div class="demo-label"><span></span>PORTFOLIO DEMO · FAKE DATA</div>
          <p class="page-kicker">Marketing Operations with AI</p>
          <h1 class="page-title">FLAGSHOP Performance AI</h1>
          <p class="page-lead">
            GA4·네이버·Meta 지표를 한 화면에 정규화하고, AI가 변화 신호와 다음 실행을 요약하는 업무 방식을 축소 재구성했습니다.
          </p>
        </div>
        <div class="dashboard-range" aria-label="데모 기간 선택">
          ${["7", "30"].map((range) => `<button type="button" data-dashboard-range="${range}" class="${state.dashboardRange === range ? "is-active" : ""}">${range}일</button>`).join("")}
        </div>
      </header>

      <div class="dashboard-context">
        <span>${demo.period}</span>
        <span>${demo.comparison}</span>
        <span class="dashboard-source"><i></i> GA4 · Naver Ads · Meta Ads</span>
      </div>

      <section class="dashboard-kpis" aria-label="핵심 성과 지표">
        ${demo.kpis.map((kpi) => `
          <article class="dashboard-kpi">
            <div><span>${kpi.label}</span><small>${kpi.source}</small></div>
            <strong>${kpi.value}</strong>
            <p class="is-${kpi.tone}">${kpi.change}</p>
          </article>
        `).join("")}
      </section>

      <div class="dashboard-main-grid">
        <section class="dashboard-panel dashboard-trend-panel">
          <div class="dashboard-panel-heading">
            <div><span>PERFORMANCE TREND</span><h2>세션·리드 통합 신호</h2></div>
            <span class="dashboard-legend"><i></i> 통합 지수</span>
          </div>
          <svg class="dashboard-chart" viewBox="0 0 100 88" preserveAspectRatio="none" aria-label="가상 성과 추이 차트">
            <line x1="8" y1="20" x2="92" y2="20"/><line x1="8" y1="49" x2="92" y2="49"/><line x1="8" y1="78" x2="92" y2="78"/>
            <polygon points="8,78 ${chartPoints} 92,78" class="dashboard-chart-area"/>
            <polyline points="${chartPoints}" class="dashboard-chart-line"/>
          </svg>
          <div class="dashboard-chart-axis"><span>START</span><span>${demo.period.toUpperCase()}</span><span>NOW</span></div>
        </section>

        <aside class="dashboard-panel ai-summary-panel">
          <div class="ai-summary-badge"><span>AI</span> 분석 완료</div>
          <h2>이번 기간 핵심 판단</h2>
          <p>${demo.insightSummary}</p>
          <div class="ai-workflow">
            <span>DATA</span><i>→</i><span>RULE</span><i>→</i><span>AI SUMMARY</span>
          </div>
          <small>실제 업무 구조를 단순화한 가상 인사이트입니다.</small>
        </aside>
      </div>

      <div class="dashboard-lower-grid">
        <section class="dashboard-panel dashboard-channel-panel">
          <div class="dashboard-panel-heading"><div><span>CHANNEL MIX</span><h2>채널별 효율 비교</h2></div></div>
          <div class="dashboard-channel-table" role="table" aria-label="가상 채널별 성과">
            <div class="dashboard-channel-row is-head" role="row"><span>채널</span><span>비용</span><span>세션</span><span>리드</span><span>CPA</span></div>
            ${demo.channels.map((row) => `<div class="dashboard-channel-row" role="row">${row.map((cell, index) => `<span class="${index === 0 ? "channel-name" : ""}">${cell}</span>`).join("")}</div>`).join("")}
          </div>
        </section>

        <section class="dashboard-panel dashboard-actions-panel">
          <div class="dashboard-panel-heading"><div><span>AI ACTION QUEUE</span><h2>다음 실행 제안</h2></div></div>
          <ol class="ai-action-list">
            <li><span class="is-opportunity">기회</span><div><strong>고의도 검색어 확장</strong><small>문의 전환이 확인된 검색 의도를 신규 콘텐츠에 반영</small></div></li>
            <li><span class="is-warning">주의</span><div><strong>Meta 소재 교체</strong><small>CTR 하락 소재를 새 메시지·비주얼 후보로 교체</small></div></li>
            <li><span class="is-check">확인</span><div><strong>이벤트 태깅 점검</strong><small>광고 클릭과 GA4 주요 이벤트 간 누락 여부 확인</small></div></li>
          </ol>
        </section>
      </div>
    </article>
  `;
}

function filterArchiveRecords(records) {
  const query = state.archive.query.trim().toLocaleLowerCase("ko");

  return records.filter((record) => {
    const statuses = record.statuses || [];
    const statusMatches = state.archive.status === "all"
      || (state.archive.status === "complete" && statuses.some((status) => status === "완료"))
      || (state.archive.status === "active" && statuses.some((status) => status.includes("진행")));

    if (!statusMatches) return false;
    if (!query) return true;

    const haystack = [record.title, ...(record.categories || []), ...(record.statuses || [])]
      .join(" ")
      .toLocaleLowerCase("ko");
    return haystack.includes(query);
  });
}

function archiveRowMarkup(record) {
  const categories = (record.categories || []).filter((item) => !/^\d+$/.test(String(item)));

  return `
    <div class="archive-row">
      <span class="archive-year">${escapeHtml(state.archive.year)}</span>
      <span class="archive-title">${escapeHtml(record.title)}</span>
      <span>
        <span class="status-badges">
          ${(record.statuses || []).map((status) => `
            <span class="status-badge ${status === "완료" ? "is-complete" : status.includes("진행") ? "is-active" : ""}">${escapeHtml(status)}</span>
          `).join("")}
        </span>
        <span class="archive-categories">${escapeHtml(categories.join(" · ") || "분류 없음")}</span>
      </span>
    </div>
  `;
}

function renderAbout() {
  const taxonomy = state.dataset.taxonomy || [];

  elements.mainContent.innerHTML = `
    <article class="content-page">
      <p class="page-kicker">About Me</p>
      <h1 class="page-title">이휘재<br />마케팅 포트폴리오</h1>
      <div class="about-grid">
        <aside class="about-card">
          <div class="about-avatar" aria-hidden="true">HJ</div>
          <h2>Brand · Content · Growth</h2>
          <p>워커스하이 Business<br />플래그샵 마케팅</p>
          <p>업무 기록 범위<br /><strong>2024.10—2026.08</strong></p>
        </aside>
        <div class="about-copy">
          <h2>역할 요약</h2>
          <p>
            브랜드 전략과 카피를 세우고, 웹·SEO·광고·PR·현장 실행까지 연결하는 마케터입니다.
            포트폴리오는 결과 수치를 과장하지 않고 확인된 기여, 산출물, 원본 업무 기록을 중심으로 구성했습니다.
          </p>
          <div class="competency-list">
            ${taxonomy.map((item) => `
              <article><h3>${escapeHtml(item.label)}</h3><p>${escapeHtml(item.description)}</p></article>
            `).join("")}
          </div>
        </div>
      </div>
    </article>
  `;
}

function renderContact() {
  elements.mainContent.innerHTML = `
    <article class="content-page">
      <p class="page-kicker">Contact</p>
      <h1 class="page-title">함께 이야기할 준비가 되어 있습니다.</h1>
      <p class="page-lead">연락처와 외부 프로필 주소는 공개 버전 배포 전에 입력합니다.</p>
      <section class="contact-panel">
        <h2>Contact Information</h2>
        <p>아래 값은 배포 전 실제 공개용 정보로 교체하는 편집 영역입니다.</p>
        <div class="contact-fields">
          <div class="contact-field"><strong>Email</strong><span>공개용 이메일 입력 예정</span></div>
          <div class="contact-field"><strong>LinkedIn</strong><span>프로필 URL 입력 예정</span></div>
          <div class="contact-field"><strong>Portfolio</strong><span>GitHub Pages URL 입력 예정</span></div>
        </div>
      </section>
    </article>
  `;
}

function handleContentClick(event) {
  const rangeButton = event.target.closest("[data-dashboard-range]");
  if (rangeButton) {
    state.dashboardRange = rangeButton.dataset.dashboardRange;
    renderDashboard();
    return;
  }

  const projectButton = event.target.closest("[data-project]");
  if (projectButton) {
    navigate({ type: "project", id: projectButton.dataset.project });
    return;
  }

  if (event.target.closest("[data-back]")) {
    navigateBack();
    return;
  }

  const yearButton = event.target.closest("[data-archive-year]");
  if (yearButton) {
    state.archive.year = yearButton.dataset.archiveYear;
    state.archive.limit = 40;
    renderArchive();
    return;
  }

  if (event.target.closest("[data-show-more]")) {
    state.archive.limit += 40;
    renderArchive();
  }
}

function handleArchiveInput(event) {
  if (event.target.id !== "archiveSearch") return;
  state.archive.query = event.target.value;
  state.archive.limit = 40;
  window.clearTimeout(handleArchiveInput.timer);
  handleArchiveInput.timer = window.setTimeout(renderArchive, 140);
}

function handleArchiveChange(event) {
  if (event.target.id !== "archiveStatus") return;
  state.archive.status = event.target.value;
  state.archive.limit = 40;
  renderArchive();
}

function updateWindowContext(title, address, status) {
  elements.windowTitle.textContent = title;
  elements.addressOutput.textContent = address;
  elements.statusText.textContent = status;
}

function updateSelectedNavigation() {
  const selectedView = state.route.type === "project" ? "home" : state.route.type;
  document.querySelectorAll(".sidebar-link[data-view]").forEach((button) => {
    button.classList.toggle("is-selected", button.dataset.view === selectedView);
  });
}

function getProject(projectId) {
  return state.dataset.portfolio_projects.find((project) => project.id === projectId);
}

function categoryLabel(categoryId) {
  return state.dataset.taxonomy.find((category) => category.id === categoryId)?.label || categoryId;
}

function listMarkup(items = []) {
  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function updateClock() {
  elements.clock.textContent = new Intl.DateTimeFormat("ko-KR", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date());
}

function renderDataError(error) {
  elements.mainContent.innerHTML = `
    <div class="empty-state">
      <strong>포트폴리오 데이터를 불러오지 못했습니다.</strong>
      <p>${escapeHtml(error.message)}</p>
      <p>로컬에서는 HTTP 서버로 열어주세요: <code>python3 -m http.server 4173</code></p>
    </div>
  `;
  elements.statusText.textContent = "데이터 로딩 오류";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
