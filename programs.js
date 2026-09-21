import { CHANNELS, DEMO_END, MONTHLY_BUDGET, selectRecords, summarize, channelsFor } from './demo-data.js';

export const APPS = [
  ['home', '내 소개', '30초로 보는 이휘재', 'about.png'],
  ['brand', '브랜드 스튜디오', '전략을 고객 접점으로', 'brand'],
  ['dashboard', 'Performance AI', '데이터에서 다음 실행으로', 'dashboard.svg'],
  ['seo', 'SEO Explorer', '검색에서 발견되는 브랜드', 'seo'],
  ['pr', 'PR 뉴스룸', '의제부터 미디어까지', 'pr'],
  ['gallery', '현장 사진첩', '현장 경험을 리드로', 'gallery'],
  ['content', '콘텐츠 메일함', '읽고, 클릭하고, 다시 만나는', 'mail.png'],
  ['ops', 'Growth & Ops', '실행 가능한 운영 구조', 'ops'],
];

const e = (v) => String(v ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
const n = (v) => Math.round(v).toLocaleString('ko-KR');
const won = (v) => `₩${n(v)}`;
const pct = (v) => `${(v * 100).toFixed(1)}%`;
const safe = (v) => { try { const url = new URL(v, location.href); return v && ['https:', 'http:'].includes(url.protocol) ? e(url.href) : ''; } catch { return ''; } };
export const icon = (app, cls = '') => app[3].includes('.') ? `<img class="${cls}" src="assets/${app[3]}" alt="" />` : `<svg class="${cls}" aria-hidden="true" viewBox="0 0 64 64"><use href="assets/program-icons.svg#${app[3]}" /></svg>`;
const badge = (text = '가상 B2B 기업 · DEMO DATA') => `<span class="p-badge">${text}</span>`;
const external = (url, label) => safe(url) ? `<a class="p-link" href="${safe(url)}" target="_blank" rel="noopener noreferrer">${e(label)} ↗</a>` : '';
const empty = (title, copy) => `<div class="p-empty"><span aria-hidden="true">＋</span><strong>${e(title)}</strong><p>${e(copy)}</p></div>`;
const steps = (items) => `<ol class="p-steps">${items.map((s, i) => `<li><span>0${i + 1}</span><p>${e(s)}</p></li>`).join('')}</ol>`;
const button = (action, label, extra = '') => `<button type="button" data-action="${action}" ${extra}>${label}</button>`;

export function createPrograms({ elements, state, navigate, updateWindowContext }) {
  const root = elements.mainContent;
  const ui = { tab: 'overview', days: 30, channel: 'all', descending: true, metric: 'spend', brand: 0, slide: 0, seo: 0, album: 0, photo: 0, content: 0, sheet: 'leads', leadStatus: 'all', prFilter: 'all', campaign: '', synced: false, tasks: [], muted: true };
  let audioContext;
  const evidence = () => state.evidence || {};
  const choices = (items, current, key) => `<div class="p-choices" aria-label="${e(key)}">${items.map(([id, label]) => button(`${key}:${id}`, e(label), `aria-pressed="${String(current) === String(id)}"`)).join('')}</div>`;
  const projects = () => state.dataset.portfolio_projects;
  const card = (title, body) => `<section class="p-panel"><h2>${e(title)}</h2>${body}</section>`;
  const appLink = (id, text) => `<button type="button" class="p-primary" data-open="${id}">${e(text)} →</button>`;

  function sound(kind = 'open') {
    if (ui.muted) return;
    try {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      void audioContext.resume().catch(() => {});
      const tones = kind === 'welcome' ? [523, 659, 784] : kind === 'done' ? [659, 880] : [740];
      tones.forEach((frequency, i) => {
        const osc = audioContext.createOscillator(), gain = audioContext.createGain();
        const start = audioContext.currentTime + i * .095;
        osc.frequency.value = frequency;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(.035, start + .01);
        gain.gain.exponentialRampToValueAtTime(.001, start + .2);
        osc.connect(gain); gain.connect(audioContext.destination);
        osc.start(start); osc.stop(start + .21);
      });
    } catch { /* Sound is optional; navigation must always work. */ }
  }

  function mount() {
    document.querySelector('.desktop-icons').innerHTML = APPS.map((a) => `<button type="button" class="desktop-icon" data-open="${a[0]}" title="${a[2]}">${icon(a)}<span>${a[1]}</span></button>`).join('');
    document.querySelector('.start-menu-main').innerHTML = APPS.map((a) => `<button type="button" data-open="${a[0]}">${icon(a)}<span><strong>${a[1]}</strong><small>${a[2]}</small></span></button>`).join('');
    document.querySelectorAll('[data-sound]').forEach((el) => el.addEventListener('click', () => {
      ui.muted = !ui.muted;
      document.querySelectorAll('[data-sound]').forEach((b) => { b.textContent = ui.muted ? '소리 끔' : '소리 켬'; b.setAttribute('aria-pressed', String(!ui.muted)); });
      sound('welcome');
    }));
    root.addEventListener('click', (event) => {
      const target = event.target.closest('[data-action]');
      if (!target) return;
      const action = target.dataset.action;
      const [key, value] = action.split(':');
      if (key === 'tab') ui.tab = value;
      if (key === 'range') ui.days = Number(value);
      if (key === 'metric') ui.metric = value;
      if (key === 'sort') ui.descending = !ui.descending;
      if (key === 'brand') { ui.brand = Number(value); ui.slide = 0; }
      if (key === 'slide') ui.slide = Number(value);
      if (key === 'seo') ui.seo = Number(value);
      if (key === 'album') { ui.album = Number(value); ui.photo = 0; }
      if (key === 'photo') ui.photo = Number(value);
      if (key === 'content') ui.content = Number(value);
      if (key === 'sheet') ui.sheet = value;
      if (key === 'campaign') ui.campaign = ui.campaign === value ? '' : value;
      if (key === 'sync') { ui.synced = true; sound('done'); }
      if (key === 'add-task') {
        ui.sheet = 'tasks';
        if (!ui.tasks.some((t) => t.id === value)) ui.tasks.push({ id: value, title: '소재·랜딩 점검' });
        ui.tasks.forEach((t) => { t.title = `${CHANNELS.find((c) => c.id === t.id)?.name || '채널'} 소재·랜딩 점검`; });
        sound('done');
      }
      if (key === 'task-done') { const task = ui.tasks.find((t) => t.id === value); if (task) task.done = !task.done; }
      if (key === 'inspect') { ui.channel = value; ui.tab = 'channels'; }
      if (key === 'copy') { if (!navigator.clipboard) { target.textContent = '주소창에서 복사해 주세요'; return; } void navigator.clipboard.writeText(location.href).then(() => { target.textContent = '주소 복사 완료'; }).catch(() => { target.textContent = '주소창에서 복사해 주세요'; }); return; }
      if (key === 'print') { window.print(); return; }
      render(state.route.type);
      [...root.querySelectorAll('[data-action]')].find((el) => el.dataset.action === action)?.focus({ preventScroll: true });
    });
    root.addEventListener('change', (event) => {
      if (event.target.id === 'pChannel') ui.channel = event.target.value;
      else if (event.target.id === 'pLeadStatus') ui.leadStatus = event.target.value;
      else if (event.target.id === 'pPrFilter') ui.prFilter = event.target.value;
      else return;
      const id = event.target.id;
      render(state.route.type);
      document.getElementById(id)?.focus();
    });
  }

  function home() {
    const profile = state.career.profile;
    return `<article class="p-home">
      <header class="p-intro"><div><span class="p-eyebrow">HWIJAE LEE · MARKETING PORTFOLIO</span><h1>브랜드의 방향을 잡고,<br>비즈니스의 다음을 만듭니다.</h1><p>${e(profile.summary)}</p><div class="p-intro-actions">${appLink('brand', '대표 경험부터 보기')}<button type="button" data-view="career">전체 경력 보기</button></div></div><div class="p-profile-tile">${safe(evidence().profilePhoto) ? `<img src="${safe(evidence().profilePhoto)}" alt="이휘재 프로필" />` : '<div class="p-monogram">HJ<span>xp</span></div>'}<strong>이휘재</strong><span>Brand · Content · Growth</span><small>Strategy to Execution.<br>Marketing to Business.</small></div></header>
      <section class="p-strengths" aria-label="핵심 역량">${profile.strengths.map((s, i) => `<div><small>0${i + 1}</small><h2>${e(s.title)}</h2><p>${e(s.description)}</p></div>`).join('')}</section>
      <div class="p-section-title"><h2>먼저 살펴볼 경험</h2><span>문제 · 판단 · 실행</span></div>
      <div class="p-feature-grid">${[['brand', '01', '흩어진 접점을 하나의 브랜드로', '리브랜딩 전략을 웹·세일즈·PR까지 연결한 과정'], ['gallery', '02', '행사를 다음 영업의 시작으로', '부스·제작물·현장 운영에서 리드 정리까지'], ['dashboard', '03', '데이터를 다음 액션으로', '광고 분석과 AI 활용 방식을 보여주는 가상 데모']].map(([id, no, title, copy]) => `<button class="p-feature" type="button" data-open="${id}"><span>${no} / ${id === 'dashboard' ? '업무 방식 데모' : '플래그샵 경험'}</span><h3>${title}</h3><p>${copy}</p><b>열어보기 ↗</b></button>`).join('')}</div>
      <div class="p-section-title"><h2>관심 있는 역량으로 바로 이동</h2></div><div class="p-app-grid">${APPS.slice(1).map((a) => `<button type="button" data-open="${a[0]}">${icon(a)}<span><strong>${a[1]}</strong><small>${a[2]}</small></span></button>`).join('')}</div>
      <footer class="p-home-footer"><span>${state.career.career_timeline.map((t) => e(t.company)).join(' → ')}</span><button type="button" data-view="contact">경력·연락</button></footer>
    </article>`;
  }

  function brand() {
    const p = projects().filter((item) => ['flagshop-rebranding', 'website-renewal'].includes(item.id))[ui.brand];
    const headings = ['왜 시작했는가', '어떻게 실행했는가', '무엇을 구축했는가'];
    const bodies = [`<p class="p-slide-lead">${e(p.objective)}</p>`, `<ul class="p-bullet-list">${p.documented_contributions.map((x) => `<li>${e(x)}</li>`).join('')}</ul>`, `<div class="p-output-tags">${p.documented_outputs.map((x) => `<span>${e(x)}</span>`).join('')}</div><p>전략을 여러 고객 접점에서 활용할 수 있는 실행물로 연결했습니다.</p><small class="p-note">정량 성과와 전후 이미지는 확인된 자료로 업데이트합니다.</small>`];
    return `<div class="p-program-head"><span>BRAND STUDIO</span>${choices([['0', '리브랜딩'], ['1', '웹 리뉴얼']], ui.brand, 'brand')}</div><div class="p-presentation"><nav class="p-slide-rail" aria-label="사례 슬라이드">${headings.map((h, i) => button(`slide:${i}`, `<small>0${i + 1}</small><strong>${h}</strong>`, `aria-pressed="${i === ui.slide}"`)).join('')}</nav><article class="p-slide"><span class="p-eyebrow">FLAGSHOP / ${e(p.period)}</span><h1>${e(p.title)}</h1><div class="p-slide-divider"></div><h2>${headings[ui.slide]}</h2>${bodies[ui.slide]}<footer><span>이휘재 · Strategy & Brand</span><span>0${ui.slide + 1} / 03</span></footer></article></div>`;
  }

  function chart(rows) {
    const days = [...new Set(rows.map((r) => r.date))];
    const totals = days.map((date) => summarize(rows.filter((r) => r.date === date))[ui.metric]);
    const max = Math.max(...totals, 1);
    const points = totals.map((v, i) => `${30 + i / Math.max(1, totals.length - 1) * 630},${170 - v / max * 140}`).join(' ');
    return `<div class="p-chart"><div class="p-chart-caption"><strong>${ui.metric === 'spend' ? '일별 집행액' : '일별 문의 리드'}</strong>${choices([['spend', '광고비'], ['leads', '리드']], ui.metric, 'metric')}</div><svg viewBox="0 0 700 210" role="img" aria-label="${ui.metric === 'spend' ? '광고비' : '문의 리드'} 추이, ${days[0]}부터 ${days.at(-1)}"><path d="M30 30H660M30 100H660M30 170H660" stroke="#dfe7ef" fill="none"/><polygon points="30,170 ${points} 660,170" fill="#e4efff"/><polyline points="${points}" stroke="#2c68b0" fill="none" stroke-width="3"/><text x="30" y="16">${ui.metric === 'spend' ? won(max) : `${n(max)}건`}</text><text x="30" y="195">${days[0]}</text><text x="660" y="195" text-anchor="end">${days.at(-1)}</text></svg></div>`;
  }

  function dashboard() {
    const rows = selectRecords(ui.days, ui.channel), total = summarize(rows), before = summarize(selectRecords(ui.days, ui.channel, true));
    const channels = channelsFor(rows), sorted = [...channels].sort((a, b) => ui.descending ? b.spend - a.spend : a.spend - b.spend);
    const best = [...channels].sort((a, b) => a.qualifiedCpl - b.qualifiedCpl)[0];
    const worst = [...channels].sort((a, b) => b.qualifiedCpl - a.qualifiedCpl)[0];
    const diff = (key) => before[key] ? `${total[key] >= before[key] ? '+' : ''}${((total[key] / before[key] - 1) * 100).toFixed(1)}%` : '비교 없음';
    const stats = [['집행액', 'spend', won(total.spend)], ['문의 리드', 'leads', `${n(total.leads)}건`], ['유효 리드', 'qualified', `${n(total.qualified)}건`], ['문의당 비용', 'cpl', won(total.cpl)], ['상담 전환', 'meetings', `${n(total.meetings)}건`], ['계약', 'contracts', `${n(total.contracts)}건`]];
    let body = '';
    if (ui.tab === 'overview') body = `<div class="p-kpis">${stats.map(([label, key, value]) => `<article><span>${label}</span><strong>${value}</strong><small>${diff(key)} <span>직전 ${ui.days}일 대비</span></small></article>`).join('')}</div><div class="p-dashboard-grid">${card('집행과 획득의 흐름', chart(rows))}${card('이번 기간의 판단', `<span class="p-badge">AI 분석 예시</span><h3>${e(best.name)}, 유효 리드 비용 우위</h3><p>선택 범위에서 유효 리드당 비용이 ${won(best.qualifiedCpl)}으로 가장 낮습니다. 채널별 리드 품질을 함께 비교해 예산 우선순위를 정합니다.</p>${button('tab:insights', '분석 근거와 다음 액션 →')}<hr><small>실시간 AI 호출 없이, 가데이터에서 계산한 지표에 규칙을 적용한 시연입니다.</small>`)}</div>${card('문의에서 계약까지', `<div class="p-funnel">${[['문의', total.leads], ['유효 리드', total.qualified], ['상담', total.meetings], ['계약', total.contracts]].map(([l, v]) => `<div><small>${l}</small><strong>${n(v)}</strong><span>${pct(total.leads ? v / total.leads : 0)} / 문의 기준</span></div>`).join('')}</div>`)}`;
    if (ui.tab === 'channels') body = `${card('채널별 효율 비교', `<div class="p-table-wrap"><table><caption>모든 비용은 원, 전환은 건. CTR = 클릭÷노출 · CVR = 문의÷클릭</caption><thead><tr><th>채널</th><th>${button('sort', `광고비 ${ui.descending ? '↓' : '↑'}`)}</th><th>노출</th><th>클릭</th><th>CTR</th><th>문의</th><th>CVR</th><th>유효 리드</th><th>유효 리드당 비용</th></tr></thead><tbody>${sorted.map((c) => `<tr><th>${e(c.name)}</th><td>${won(c.spend)}</td><td>${n(c.impressions)}</td><td>${n(c.clicks)}</td><td>${pct(c.ctr)}</td><td>${n(c.leads)}</td><td>${pct(c.cvr)}</td><td>${n(c.qualified)}</td><td>${won(c.qualifiedCpl)}</td></tr>`).join('')}</tbody><tfoot><tr><th>합계</th><td>${won(total.spend)}</td><td>${n(total.impressions)}</td><td>${n(total.clicks)}</td><td>${pct(total.ctr)}</td><td>${n(total.leads)}</td><td>${pct(total.cvr)}</td><td>${n(total.qualified)}</td><td>${won(total.qualifiedCpl)}</td></tr></tfoot></table></div>`)}`;
    if (ui.tab === 'campaigns') body = `${card('채널별 대표 캠페인', `<p>채널당 1개 캠페인을 둔 단순화된 시나리오입니다. 캠페인을 선택하면 운영 판단을 확인할 수 있습니다.</p><div class="p-campaigns">${channels.map((c) => `<div>${button(`campaign:${c.id}`, `<span>${e(c.name)} / B2B 문의 획득</span><strong>${won(c.spend)}</strong><small>문의 ${n(c.leads)} · 유효 리드 ${n(c.qualified)}</small>`, `aria-expanded="${ui.campaign === c.id}"`)}${ui.campaign === c.id ? `<div class="p-campaign-detail"><strong>목표: 서비스 도입 상담 확보</strong><p>클릭 수보다 유효 리드 비율(${pct(c.qualified / c.leads)})을 먼저 확인합니다. 문의당 비용 ${won(c.cpl)}과 상담 전환을 함께 검토합니다.</p>${button(`inspect:${c.id}`, '채널 지표 확인')}</div>` : ''}</div>`).join('')}</div>`)}`;
    if (ui.tab === 'insights') body = `<div class="p-insights">${card('01 / 기회 발견', `<span class="p-badge">규칙 기반 분석 예시</span><h2>${e(best.name)} 확장 가능성 점검</h2><p>유효 리드 ${n(best.qualified)}건 · 유효 리드당 비용 ${won(best.qualifiedCpl)}. 저비용만으로 증액하지 않고, 영업 피드백과 확보 가능한 수요를 함께 확인합니다.</p>${button(`inspect:${best.id}`, '지표 근거 보기')}`)}${card('02 / 실행 우선순위', `<h2>${e(worst.name)} 소재·랜딩 점검</h2><p>선택한 채널 중 유효 리드당 비용이 ${won(worst.qualifiedCpl)}으로 가장 높습니다. 타깃·메시지·랜딩 일치 여부를 점검할 작업으로 전환합니다.</p>${button(`add-task:${worst.id}`, ui.tasks.some((t) => t.id === worst.id) ? '운영 시트에 등록됨 ✓' : '운영 시트에 작업 등록', ui.tasks.some((t) => t.id === worst.id) ? 'disabled' : '')} ${appLink('ops', '운영 시트 열기')}`)}</div>`;
    if (ui.tab === 'api') body = `${card('데이터 연결 관리', `<p>연결 완료 화면을 재현한 데모입니다. 실제 광고 계정·토큰·API 요청은 사용하지 않습니다.</p><div class="p-connectors">${[...new Set(CHANNELS.map((c) => c.vendor)), 'GA4', 'CRM'].map((vendor) => `<article><span class="p-connection-dot"></span><strong>${e(vendor)}</strong><span>연결됨 · 데모</span><small>${vendor === 'CRM' ? '유효 리드·상담·계약' : vendor === 'GA4' ? '이벤트·유입 경로' : '광고비·노출·클릭·전환'}</small></article>`).join('')}</div><div class="p-sync">${button('sync', '샘플 동기화 시연')}<span role="status">${ui.synced ? '로컬 샘플 검증 완료 · 외부 요청 0건' : '기준 데이터: 2026.08.31 · 실제 연결 아님'}</span></div>`)}`;
    return `<header class="p-dashboard-title"><div>${badge()}<h1>Performance AI</h1><p>월 ${won(MONTHLY_BUDGET)} 예산 시나리오 · 실제 플래그샵 실적 아님</p></div><div class="p-filters"><label for="pChannel">채널</label><select id="pChannel"><option value="all">전체 채널</option>${CHANNELS.map((c) => `<option value="${c.id}" ${ui.channel === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}</select>${choices([['7', '7일'], ['30', '30일'], ['90', '90일']], ui.days, 'range')}</div></header>${choices([['overview', '종합 현황'], ['channels', '채널 비교'], ['campaigns', '캠페인'], ['insights', 'AI 실행 제안'], ['api', 'API 연결']], ui.tab, 'tab')}<p class="p-period">${rows[0].date} — ${DEMO_END} · 가상 CRM의 채널별 단일 귀속 기준 · 매체별 중복 전환 합산 아님</p>${body}`;
  }

  function seo() {
    const items = evidence().seo || [], item = items[ui.seo];
    if (!item) return empty('검색 사례 준비 중', '검색어와 확인된 검색 결과를 업데이트합니다.');
    return `<div class="p-ie-bar"><span>주소</span><output>portfolio://search/${e(item.id)}</output><span class="p-ie-globe">e</span></div><div class="p-search-home"><span class="p-search-wordmark">Hwi<span>Search</span></span><p>검색되는 구조를 설계합니다.</p><div class="p-search-box"><span>${e(item.query)}</span><span>검색 주제 예시</span></div>${choices(items.map((x, i) => [String(i), x.label]), ui.seo, 'seo')}</div><div class="p-search-results"><article><span class="p-eyebrow">SEARCH INTENT → STRUCTURE → EVIDENCE</span><h1>${e(item.label)}</h1><p>${e(item.intent)}</p>${steps(item.actions || [])}</article><section>${safe(item.screenshot) && item.capturedAt ? `<figure><img class="p-evidence-image" src="${safe(item.screenshot)}" alt="${e(item.query)} 검색 결과 캡처" /><figcaption>확인일 ${e(item.capturedAt)} · 검색 결과는 시점과 환경에 따라 달라집니다.</figcaption></figure>${external(item.url, '대상 페이지 보기')}${external(`https://www.google.com/search?q=${encodeURIComponent(item.query)}`, '현재 Google 검색 보기')}` : empty('검색 결과 캡처 업데이트 예정', '검색어·확인일·대상 URL이 있는 실제 자료를 등록합니다. 현재 순위를 임의로 표시하지 않습니다.')}</section></div>`;
  }

  function pr() {
    const articles = (evidence().articles || []).filter((a) => a.title && a.date);
    const visible = ui.prFilter === 'featured' ? articles.filter((a) => a.featured) : articles;
    return `<header class="p-news-masthead"><span>FLAGSHOP / PRESS ROOM</span><h1>브랜드의 이야기를<br>시장의 의제로.</h1><p>뉴스 가치 발굴 · 원고 작성 · 미디어 관계 · 배포와 기록</p></header><div class="p-news-layout"><section><div class="p-section-title"><h2>기사 기록 <small>${articles.length}건 등록</small></h2><label>보기 <select id="pPrFilter"><option value="all">전체</option><option value="featured" ${ui.prFilter === 'featured' ? 'selected' : ''}>주요 기사</option></select></label></div>${visible.length ? visible.map((a) => `<article class="p-news-item"><small>${e(a.date)} · ${e(a.outlet)}</small><h2>${e(a.title)}</h2><p>${e(a.contribution || '')}</p>${a.featured ? external(a.url, '주요 기사 원문') : '<span class="p-note">보도 기록</span>'}</article>`).join('') : empty(articles.length ? '선택한 주요 기사가 없습니다' : '공개 기사 목록 업데이트 예정', '기사 제목·매체·발행일과 직접 담당한 역할을 확인한 뒤 등록합니다.')}</section>${card('Always-on PR', steps(['서비스·고객 사례에서 의제 선정', '메시지와 원고를 미디어에 맞게 구성', '배포 결과를 다음 기획에 반영']) + '<button type="button" data-project="always-on-pr-program">PR 업무 경험 보기 →</button>')}</div>`;
  }

  function gallery() {
    const albums = evidence().albums || [], album = albums[ui.album];
    if (!album) return empty('사진첩 준비 중', '행사별 실제 현장 자료를 업데이트합니다.');
    const photos = (album.photos || []).filter((p) => safe(p.src));
    ui.photo = Math.min(ui.photo, Math.max(0, photos.length - 1));
    const photo = photos[ui.photo];
    return `<div class="p-photo-layout"><aside class="p-albums"><h2>내 사진첩</h2>${albums.map((a, i) => button(`album:${i}`, `${icon(APPS[5])}<span>${e(a.title)}<small>${(a.photos || []).length}장</small></span>`, `aria-pressed="${ui.album === i}"`)).join('')}</aside><article><header class="p-photo-title"><span>FIELD MARKETING</span><h1>${e(album.title)}</h1></header><div class="p-photo-stage">${photo ? `<figure><img src="${safe(photo.src)}" alt="${e(photo.alt || photo.caption || album.title)}"/><figcaption>${e(photo.caption || '')}</figcaption></figure>` : empty('현장 사진 업데이트 예정', '부스 전경 · 고객 경험 · 제작물 · 리드 수집 장면을 실제 사진으로 채웁니다.')}</div><div class="p-photo-controls">${button(`photo:${Math.max(0, ui.photo - 1)}`, '← 이전', ui.photo === 0 ? 'disabled' : '')}<span>${photos.length ? `${ui.photo + 1} / ${photos.length}` : '0 / 0'}</span>${button(`photo:${ui.photo + 1}`, '다음 →', ui.photo >= photos.length - 1 ? 'disabled' : '')}</div><div class="p-photo-caption"><div><small>행사의 목적</small><p>${e(album.goal)}</p></div><div><small>담당 범위</small><p>${e(album.role)}</p></div></div></article></div>`;
  }

  function content() {
    const items = evidence().content || [], item = items[ui.content];
    if (!item) return empty('콘텐츠 준비 중', '콘텐츠 원본을 업데이트합니다.');
    return `<div class="p-mail-layout"><aside><h2>내 콘텐츠함</h2><small>고객 여정별 메시지</small>${items.map((c, i) => button(`content:${i}`, `<small>${e(c.type)}</small><strong>${e(c.title)}</strong>`, `aria-pressed="${ui.content === i}"`)).join('')}</aside><article><header class="p-mail-header"><p>보낸 사람 <strong>이휘재 / Marketing</strong></p><p>콘텐츠 <strong>${e(item.type)}</strong></p><h1>${e(item.title)}</h1></header><div class="p-mail-body"><p>${e(item.summary)}</p>${steps(item.steps || [])}${safe(item.image) ? `<img class="p-evidence-image" src="${safe(item.image)}" alt="${e(item.title)} 원본 콘텐츠" />` : empty('대표 콘텐츠 원본 업데이트 예정', '뉴스레터·블로그·EDM·SNS의 실제 결과물을 넣을 공간입니다.')}${external(item.url, '콘텐츠 원문 보기')}</div></article></div>`;
  }

  function ops() {
    const totals = channelsFor(selectRecords(30));
    const leads = Array.from({ length: 16 }, (_, i) => ({ company: `예시 기업 ${String(i + 1).padStart(2, '0')}`, source: CHANNELS[i % CHANNELS.length].name, status: ['신규 문의', '유효 리드', '상담 진행', '계약 검토'][i % 4], next: ['관심 서비스 확인', '요건 정리·영업 이관', '제안서 전달', '계약 조건 검토'][i % 4] }));
    let heads, rows;
    if (ui.sheet === 'leads') { heads = ['기업', '유입 채널', '진행 단계', '다음 행동']; rows = leads.filter((l) => ui.leadStatus === 'all' || l.status === ui.leadStatus).map((l) => [l.company, l.source, l.status, l.next]); }
    if (ui.sheet === 'plan') { heads = ['캠페인', '목적', '주요 실행', '판단 기준']; rows = [['서비스 검색', '도입 수요 확보', '키워드·랜딩 정렬', '유효 리드당 비용'], ['행사 후속', '현장 리드 전환', 'DB 분류·영업 이관', '후속 상담 전환'], ['뉴스레터', '기존 리드 재접점', '관심별 콘텐츠 발송', '클릭과 상담 요청'], ['브랜드 PR', '서비스 이해 확장', '의제·원고·배포', '메시지 반영 여부']]; }
    if (ui.sheet === 'budget') { heads = ['채널', '월 계획 예산', '최근 30일 집행', '예산 대비 집행률']; rows = totals.map((t) => [t.name, won(CHANNELS.find((c) => c.id === t.id).spend), won(t.spend), pct(t.spend / CHANNELS.find((c) => c.id === t.id).spend)]); }
    if (ui.sheet === 'tasks') { heads = ['작업', '출처', '상태', '실행']; rows = ui.tasks.map((t) => [t.title, 'Performance AI · 데모', t.done ? '완료' : '검토 대기', { html: button(`task-done:${t.id}`, t.done ? '다시 열기' : '완료 처리') }]); }
    const table = `<div class="p-sheet-scroll"><table class="p-sheet"><caption>${ui.sheet === 'leads' ? '16개 가상 기업의 리드 관리 예시. 대시보드 전체 리드와 별도 표본입니다.' : '마케팅 운영 예시 · 실제 고객·예산·프로젝트 정보 아님'}</caption><thead><tr><th></th>${heads.map((h, i) => `<th><small>${String.fromCharCode(65 + i)}</small>${h}</th>`).join('')}</tr></thead><tbody>${rows.map((row, i) => `<tr><th>${i + 1}</th>${row.map((cell) => `<td>${typeof cell === 'object' ? cell.html : e(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    return `<div class="p-sheet-title"><div>${badge('OPERATIONS DEMO · 가상 데이터')}<h1>Marketing-Operations.xls</h1></div>${ui.sheet === 'leads' ? `<label>진행 단계 <select id="pLeadStatus"><option value="all">전체</option>${['신규 문의', '유효 리드', '상담 진행', '계약 검토'].map((s) => `<option ${ui.leadStatus === s ? 'selected' : ''}>${s}</option>`).join('')}</select></label>` : ''}</div><div class="p-formula"><span>A1</span><b>ƒx</b><output>${ui.sheet === 'budget' ? '집행률 = 집행액 ÷ 계획 예산' : ui.sheet === 'tasks' ? '분석에서 실행으로 · 이번 방문 동안 유지' : '고객 접점을 다음 행동과 담당 단계로 연결'}</output></div>${table}${!rows.length ? empty('등록된 작업이 없습니다', 'Performance AI → AI 실행 제안에서 작업을 등록하면 여기에 표시됩니다.') + appLink('dashboard', 'Performance AI 열기') : ''}<div class="p-sheet-tabs">${choices([['leads', '리드 관리'], ['plan', '캠페인 기획'], ['budget', '예산 관리'], ['tasks', `실행 작업 (${ui.tasks.length})`]], ui.sheet, 'sheet')}</div>`;
  }

  function contact() {
    const c = evidence().contact || {};
    return `<article class="p-contact"><span class="p-eyebrow">LET'S TALK ABOUT WHAT'S NEXT</span><h1>다음 비즈니스의 문제를<br>함께 풀고 싶습니다.</h1><p>브랜드의 방향부터 콘텐츠, 고객 획득과 운영까지.<br>문제에 필요한 마케팅을 설계하고 실행합니다.</p><div class="p-intro-actions">${c.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email) ? `<a class="p-link" href="mailto:${e(c.email)}">${e(c.email)}</a>` : '<span class="p-note">공개 연락처 업데이트 예정</span>'}${external(c.resume, '이력서 보기')}${external(c.profile, '외부 프로필')}</div><hr><button type="button" data-view="career">경력 확인</button> ${button('copy', '현재 포트폴리오 주소 복사')}<p class="p-note">이 포트폴리오는 AI와 함께 기획·구현했습니다. 실제 업무 경험과 업무 방식 데모는 화면에 구분해 표시합니다.</p></article>`;
  }

  function render(type) {
    const renderers = { home, brand, dashboard, seo, pr, gallery, content, ops, contact };
    if (!renderers[type]) return false;
    const app = APPS.find((a) => a[0] === type), title = app?.[1] || '경력·연락';
    root.className = `explorer-content program-content program-${type}`;
    root.innerHTML = `${evidence().loadError ? '<p class="p-note" role="status">추가 자료를 불러오지 못했습니다. 기본 포트폴리오와 데모를 먼저 살펴보세요.</p>' : ''}${renderers[type]()}`;
    updateWindowContext(`${title} — HWIJAE XP`, `C:\\Portfolio\\${title}`, ['dashboard', 'ops'].includes(type) ? '가상 데이터 · 실제 계정과 연결되지 않은 데모' : '이휘재 · Marketing Portfolio');
    elements.portfolioTask.querySelector('span').textContent = title;
    return true;
  }
  function updateProfile() {
    const photo = evidence().profilePhoto;
    if (!safe(photo)) return;
    document.querySelectorAll('.boot-profile > span, .login-avatar, .start-avatar').forEach((el) => {
      const img = document.createElement('img');
      img.src = photo; img.alt = '이휘재';
      el.replaceChildren(img);
    });
  }
  return { mount, render, sound, updateProfile };
}
