const fs = require('node:fs');
const path = require('node:path');
const { request } = require('@playwright/test');

const baseURL = 'https://data.melbourne.vic.gov.au';
const dataset = 'trees-with-species-and-dimensions-urban-forest';
const basePath = `/api/explore/v2.1/catalog/datasets/${dataset}`;
const recordsPath = `${basePath}/records`;
const output = path.join(__dirname, '..', 'evidence', 'Milestone-A', 'preflight-results.json');
const query = (params) => `${recordsPath}?${new URLSearchParams(params)}`;
const quote = (value) => `'${String(value).replaceAll("'", "''")}'`;
const pause = () => new Promise((resolve) => setTimeout(resolve, 700));

const log = {
  startedAtUtc: new Date().toISOString(),
  dataset,
  node: process.version,
  playwright: require('@playwright/test/package.json').version,
  requests: [],
  observations: {},
};

async function main() {
  const client = await request.newContext({
    baseURL,
    timeout: 20000,
    extraHTTPHeaders: { Accept: 'application/json' },
  });

  async function get(name, url) {
    if (log.requests.length) await pause();
    const response = await client.get(url);
    const status = response.status();
    const contentType = response.headers()['content-type'] || '';
    log.requests.push({ name, path: url, status, contentType });
    console.log(`${name}: ${status} ${contentType}`);

    if (status === 403 || status === 429) throw new Error(`Stop on HTTP ${status}`);
    if (!contentType.includes('json')) throw new Error(`Stop: ${name} did not return JSON`);
    return { status, body: await response.json() };
  }

  try {
    const first = await get('sorted records', query({ limit: 5, order_by: 'com_id ASC' }));
    const rows = first.body.results;
    if (first.status !== 200 || !Array.isArray(rows) || !rows.length) {
      throw new Error('No usable records returned');
    }
    const sample = rows.find((row) =>
      row.com_id != null && typeof row.genus === 'string' && row.genus.trim());
    if (!sample) throw new Error('No current row has both com_id and genus');

    const metadata = await get('dataset metadata', basePath);
    const metadataCount = metadata.body?.metas?.default?.records_count ?? null;
    const filtered = await get('genus filter',
      query({ where: `genus = ${quote(sample.genus)}`, limit: 2 }));
    const invalidWhere = await get('unknown where field',
      query({ where: 'field_that_does_not_exist = 1', limit: 1 }));
    const invalidOrder = await get('unknown order_by field',
      query({ order_by: 'field_that_does_not_exist', limit: 1 }));
    const limit100 = await get('limit 100', query({ limit: 100 }));
    const limit101 = await get('limit 101', query({ limit: 101 }));
    const second = await get('next sorted page',
      query({ limit: 5, offset: 5, order_by: 'com_id ASC' }));
    const lookup = await get('com_id lookup',
      query({ where: `com_id = ${quote(sample.com_id)}`, limit: 2 }));
    const missing = await get('unused com_id',
      query({ where: "com_id = '999999999'", limit: 1 }));
    const edge10000 = await get('offset plus limit 10000',
      query({ limit: 100, offset: 9900 }));
    const edge10001 = await get('offset plus limit 10001',
      query({ limit: 100, offset: 9901 }));

    const found = lookup.body.results?.find((row) => row.com_id === sample.com_id);
    const firstIds = new Set(rows.map((row) => row.com_id));
    const noRepeatedIds = Array.isArray(second.body.results) &&
      second.body.results.every((row) => !firstIds.has(row.com_id));
    const filterMatches = Array.isArray(filtered.body.results) &&
      filtered.body.results.every((row) => row.genus === sample.genus);

    log.observations = {
      records: {
        totalCount: first.body.total_count,
        rowCount: rows.length,
        fields: Object.keys(sample),
      },
      metadata: { recordsCount: metadataCount },
      filter: { selectedGenus: sample.genus, allRowsMatch: filterMatches },
      invalidWhere: { status: invalidWhere.status, message: invalidWhere.body.message },
      invalidOrder: { status: invalidOrder.status, message: invalidOrder.body.message },
      pageSize: {
        limit100Status: limit100.status,
        limit100Rows: limit100.body.results?.length ?? null,
        limit101Status: limit101.status,
        limit101Message: limit101.body.message ?? null,
      },
      pagination: { noRepeatedComId: noRepeatedIds },
      lookup: {
        source: { com_id: sample.com_id, genus: sample.genus },
        returned: found ? { com_id: found.com_id, genus: found.genus } : null,
        idMatches: found?.com_id === sample.com_id,
        genusMatches: found?.genus === sample.genus,
      },
      missingAsset: {
        status: missing.status,
        totalCount: missing.body.total_count,
        returnedRows: missing.body.results?.length ?? null,
      },
      pagingEdge: {
        at10000: {
          status: edge10000.status,
          rows: edge10000.body.results?.length ?? null,
          message: edge10000.body.message ?? null,
        },
        at10001: {
          status: edge10001.status,
          rows: edge10001.body.results?.length ?? null,
          message: edge10001.body.message ?? null,
        },
      },
      countMatches: first.body.total_count === metadataCount,
    };

    log.decision =
      metadata.status === 200 && filtered.status === 200 && filterMatches &&
      invalidWhere.status === 400 && invalidOrder.status === 400 &&
      limit100.status === 200 && limit100.body.results?.length <= 100 &&
      limit101.status === 400 && second.status === 200 && noRepeatedIds &&
      lookup.status === 200 && log.observations.lookup.idMatches &&
      log.observations.lookup.genusMatches && missing.status === 200 &&
      missing.body.total_count === 0 && log.observations.countMatches
        ? 'ready'
        : 'investigate';

    if (log.decision !== 'ready') process.exitCode = 1;
  } catch (error) {
    log.decision = 'blocked or inconclusive';
    log.error = error.message;
    process.exitCode = 1;
    console.error(error.message);
  } finally {
    log.finishedAtUtc = new Date().toISOString();
    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.writeFileSync(output, `${JSON.stringify(log, null, 2)}\n`);
    console.log(`Decision: ${log.decision}`);
    console.log(`Saved: ${output}`);
    await client.dispose();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
