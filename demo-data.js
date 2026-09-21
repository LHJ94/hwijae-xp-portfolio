// A fixed B2B scenario. Every metric is derived from the same daily records.
export const CHANNELS = [
  { id: 'naver', name: '네이버 검색', vendor: 'Naver Ads', spend: 26000000, cpc: 1900, cvr: .036, quality: .72 },
  { id: 'google', name: 'Google 검색', vendor: 'Google Ads', spend: 24000000, cpc: 2200, cvr: .041, quality: .76 },
  { id: 'meta', name: 'Meta', vendor: 'Meta Ads', spend: 18000000, cpc: 850, cvr: .017, quality: .45 },
  { id: 'gfa', name: '네이버 GFA', vendor: 'Naver GFA', spend: 12000000, cpc: 700, cvr: .012, quality: .42 },
  { id: 'youtube', name: 'YouTube', vendor: 'Google Ads', spend: 10000000, cpc: 1200, cvr: .009, quality: .38 },
  { id: 'display', name: 'Google Display', vendor: 'Google Ads', spend: 9000000, cpc: 650, cvr: .012, quality: .4 },
  { id: 'kakao', name: 'Kakao', vendor: 'Kakao', spend: 9000000, cpc: 720, cvr: .014, quality: .48 },
  { id: 'linkedin', name: 'LinkedIn', vendor: 'LinkedIn', spend: 12000000, cpc: 4200, cvr: .043, quality: .84 },
];
export const DEMO_END = '2026-08-31';
export const MONTHLY_BUDGET = CHANNELS.reduce((sum, channel) => sum + channel.spend, 0);
export const FIELDS = ['spend', 'impressions', 'clicks', 'leads', 'qualified', 'meetings', 'contracts'];

export function makeRecords() {
  const rows = [];
  // 180 days supports the previous-period comparison even for a 90-day filter.
  for (let day = 0; day < 180; day++) {
    const date = new Date(Date.UTC(2026, 7, 31 - (179 - day))).toISOString().slice(0, 10);
    CHANNELS.forEach((channel, index) => {
      const weight = .88 + ((day * 7 + index * 3) % 11) * .025;
      const spend = Math.round(channel.spend / 30 * weight);
      const fatigue = channel.id === 'meta' && day >= 166 ? .72 : 1;
      const clicks = Math.round(spend / channel.cpc * fatigue);
      const impressions = Math.round(clicks / (.016 + index * .0012));
      const leads = Math.round(clicks * channel.cvr * (day > 149 ? 1.06 : 1));
      const qualified = Math.round(leads * channel.quality);
      const meetings = Math.round(qualified * .48);
      const contracts = Math.round(meetings * .24);
      rows.push({ date, channel: channel.id, spend, impressions, clicks, leads, qualified, meetings, contracts });
    });
  }
  return rows;
}
export const RECORDS = makeRecords();

export function summarize(rows) {
  const total = Object.fromEntries(FIELDS.map((field) => [field, rows.reduce((sum, row) => sum + row[field], 0)]));
  return { ...total, cpl: total.leads ? total.spend / total.leads : 0, qualifiedCpl: total.qualified ? total.spend / total.qualified : 0, ctr: total.impressions ? total.clicks / total.impressions : 0, cvr: total.clicks ? total.leads / total.clicks : 0 };
}

export function selectRecords(days = 30, channel = 'all', previous = false) {
  const end = new Date(`${DEMO_END}T00:00:00Z`);
  if (previous) end.setUTCDate(end.getUTCDate() - days);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - days + 1);
  const first = start.toISOString().slice(0, 10), last = end.toISOString().slice(0, 10);
  return RECORDS.filter((row) => row.date >= first && row.date <= last && (channel === 'all' || row.channel === channel));
}

export function channelsFor(rows) {
  return CHANNELS.map((channel) => ({ ...channel, ...summarize(rows.filter((row) => row.channel === channel.id)) })).filter((channel) => channel.spend > 0);
}
