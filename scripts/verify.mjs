import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { CHANNELS, RECORDS, FIELDS, MONTHLY_BUDGET, summarize, selectRecords, channelsFor } from '../demo-data.js';

assert.equal(CHANNELS.length, 8);
assert.equal(MONTHLY_BUDGET, 120000000);
assert.equal(RECORDS.length, 180 * 8);
assert.equal(new Set(RECORDS.map((r) => `${r.date}/${r.channel}`)).size, RECORDS.length);
for (const row of RECORDS) {
  for (const field of FIELDS) assert(Number.isInteger(row[field]) && row[field] >= 0);
  assert(row.impressions >= row.clicks && row.clicks >= row.leads);
  assert(row.leads >= row.qualified && row.qualified >= row.meetings && row.meetings >= row.contracts);
}
for (const days of [7, 30, 90]) {
  for (const id of ['all', ...CHANNELS.map((c) => c.id)]) {
    const rows = selectRecords(days, id), previous = selectRecords(days, id, true);
    assert.equal(rows.length, days * (id === 'all' ? 8 : 1));
    assert.equal(previous.length, rows.length);
    assert(previous.at(-1).date < rows[0].date);
    const sum = summarize(rows), channels = channelsFor(rows);
    for (const field of FIELDS) assert.equal(sum[field], channels.reduce((total, c) => total + c[field], 0));
    assert.equal(sum.cpl, sum.spend / sum.leads);
    assert.equal(sum.cvr, sum.leads / sum.clicks);
    assert.equal(sum.ctr, sum.clicks / sum.impressions);
  }
}
const evidence = JSON.parse(await readFile(new URL('../data/evidence-public.json', import.meta.url), 'utf8'));
assert(Array.isArray(evidence.articles) && Array.isArray(evidence.albums) && Array.isArray(evidence.seo));
for (const item of evidence.seo) if (item.screenshot) assert(item.capturedAt, 'SEO capture requires a date');
for (const article of evidence.articles) {
  assert(article.title && article.date && article.outlet, 'Article requires title/date/outlet');
  if (article.featured) assert(/^https?:\/\//.test(article.url), 'Featured article requires a real source URL');
}
console.log('PASS: 1,440 daily records; funnel consistency; 27 period/channel combinations; totals and conversion formulas; evidence schema');
