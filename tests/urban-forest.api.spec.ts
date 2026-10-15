import { test, expect, type APIRequestContext } from '@playwright/test';
import boundaryCases from '../test-data/boundary-cases.json';

const apiRoot = 'https://data.melbourne.vic.gov.au';
const dataset = 'trees-with-species-and-dimensions-urban-forest';
const datasetPath = `/api/explore/v2.1/catalog/datasets/${dataset}`;
const recordsPath = `${datasetPath}/records`;
const unknownField = 'field_that_does_not_exist';

type Tree = { com_id?: string | number; genus?: string | null };
type TreeResponse = { total_count: number; results: Tree[] };
type SampleTree = { com_id: string; genus: string };

let currentTree: SampleTree;

function saveEvidence(id: string, values: Record<string, unknown>) {
  console.log(`EVIDENCE ${JSON.stringify({ id, ...values })}`);
}

function recordsQuery(parameters: Record<string, string | number>) {
  const search = new URLSearchParams();
  for (const [name, value] of Object.entries(parameters)) {
    search.set(name, String(value));
  }
  return `${recordsPath}?${search}`;
}

function quoted(value: string) {
  return `'${value.replaceAll("'", "''")}'`;
}

async function getJson(request: APIRequestContext, path: string) {
  await new Promise((resolve) => setTimeout(resolve, 700));
  const response = await request.get(`${apiRoot}${path}`, {
    headers: { Accept: 'application/json' },
    timeout: 20_000,
  });
  const status = response.status();
  const contentType = response.headers()['content-type'] ?? '';
  console.log(`REQUEST ${JSON.stringify({ path, status, contentType })}`);
  if (status === 403 || status === 429 || !contentType.toLowerCase().includes('json')) {
    throw new Error(`Stop and check API access. HTTP ${status}, content type ${contentType}`);
  }
  const body = await response.json();
  const rows = Array.isArray(body?.results) ? body.results : undefined;
  console.log(`RESPONSE ${JSON.stringify({
    resultCount: rows?.length,
    totalCount: body?.total_count,
    comIds: rows && rows.length <= 10 ? rows.map((row: Tree) => row.com_id) : undefined,
    genusValues: rows && rows.length <= 10 ? rows.map((row: Tree) => row.genus) : undefined,
    metadataRecordsCount: body?.metas?.default?.records_count,
    errorBody: status >= 400 ? body : undefined,
  })}`);
  return { status, contentType, body };
}

test.beforeAll(async ({ request }) => {
  const { status, body } = await getJson(request, recordsQuery({
    limit: 5,
    order_by: 'com_id ASC',
  }));
  expect(status).toBe(200);
  expect(Array.isArray(body.results)).toBe(true);
  const tree = (body.results as Tree[]).find((row) =>
    row.com_id != null && String(row.com_id).trim().length > 0 &&
    typeof row.genus === 'string' && row.genus.trim().length > 0);
  expect(tree, 'A current tree with com_id and genus is needed').toBeTruthy();
  currentTree = { com_id: String(tree!.com_id), genus: tree!.genus!.trim() };
});

test.describe('Tree data and consistency', () => {
  test('T01 Availability and shape @smoke', async ({ request }) => {
    const { status, contentType, body } = await getJson(request, recordsQuery({ limit: 5 }));
    const data = body as TreeResponse;
    expect(status).toBe(200);
    expect(contentType).toContain('application/json');
    expect(Array.isArray(data.results)).toBe(true);
    expect(data.results.length).toBeGreaterThan(0);
    expect(typeof data.total_count).toBe('number');
    const sample = data.results.find((row) =>
      row.com_id != null && String(row.com_id).trim().length > 0 &&
      typeof row.genus === 'string' && row.genus.trim().length > 0);
    expect(sample).toBeTruthy();
    saveEvidence('T01', {
      status, contentType, resultCount: data.results.length,
      totalCount: data.total_count, sampleFieldNames: Object.keys(sample!),
      sample: { com_id: String(sample!.com_id), genus: sample!.genus },
    });
  });

  test('T02 Bounded pagination', async ({ request }) => {
    const first = await getJson(request, recordsQuery({ limit: 5, offset: 0, order_by: 'com_id ASC' }));
    const second = await getJson(request, recordsQuery({ limit: 5, offset: 5, order_by: 'com_id ASC' }));
    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    const firstRows = (first.body as TreeResponse).results;
    const secondRows = (second.body as TreeResponse).results;
    expect(firstRows).toHaveLength(5);
    expect(secondRows).toHaveLength(5);
    const rawIds = [...firstRows, ...secondRows].map((row) => row.com_id);
    expect(rawIds.every((id) => id != null && String(id).trim().length > 0)).toBe(true);
    const firstIds = firstRows.map((row) => String(row.com_id));
    const secondIds = secondRows.map((row) => String(row.com_id));
    const allIds = [...firstIds, ...secondIds];
    expect(firstIds).toEqual([...firstIds].sort());
    expect(secondIds).toEqual([...secondIds].sort());
    expect(firstIds[firstIds.length - 1] < secondIds[0]).toBe(true);
    expect(new Set(allIds).size).toBe(10);
    saveEvidence('T02', {
      firstStatus: first.status, secondStatus: second.status,
      firstContentType: first.contentType, secondContentType: second.contentType,
      firstPageLength: firstRows.length, secondPageLength: secondRows.length,
      firstOrderedIds: firstIds, secondOrderedIds: secondIds,
      firstIdSet: [...new Set(firstIds)], secondIdSet: [...new Set(secondIds)],
      distinctIdsAcrossPages: new Set(allIds).size,
      orderingComparedAs: 'text',
    });
  });

  test('T03 Tree lookup consistency', async ({ request }) => {
    const result = await getJson(request, recordsQuery({
      where: `com_id = ${quoted(currentTree.com_id)}`,
      limit: 2,
    }));
    expect(result.status).toBe(200);
    const rows = (result.body as TreeResponse).results;
    expect(Array.isArray(rows)).toBe(true);
    expect(rows.length).toBeGreaterThan(0);
    const match = rows.find((row) => String(row.com_id) === currentTree.com_id);
    expect(match).toBeTruthy();
    expect(String(match!.com_id)).toBe(currentTree.com_id);
    expect(match!.genus).toBe(currentTree.genus);
    saveEvidence('T03', {
      status: result.status, contentType: result.contentType,
      returnedRows: rows.length, source: currentTree,
      lookup: { com_id: String(match!.com_id), genus: match!.genus },
    });
  });

  test('T04 Genus filter accuracy', async ({ request }) => {
    const result = await getJson(request, recordsQuery({
      where: `genus = ${quoted(currentTree.genus)}`,
      limit: 5,
    }));
    expect(result.status).toBe(200);
    const rows = (result.body as TreeResponse).results;
    expect(Array.isArray(rows)).toBe(true);
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((row) => row.genus === currentTree.genus)).toBe(true);
    saveEvidence('T04', {
      status: result.status, contentType: result.contentType,
      filterGenus: currentTree.genus, returnedRows: rows.length,
      comparedGenusValues: rows.map((row) => row.genus),
    });
  });

  test('T07 Dataset total comparison', async ({ request }) => {
    const records = await getJson(request, recordsQuery({ limit: 1 }));
    const metadata = await getJson(request, datasetPath);
    expect(records.status).toBe(200);
    expect(metadata.status).toBe(200);
    const dataTotal = (records.body as TreeResponse).total_count;
    const metadataTotal = metadata.body?.metas?.default?.records_count;
    expect(typeof dataTotal).toBe('number');
    expect(typeof metadataTotal).toBe('number');
    expect(dataTotal).toBe(metadataTotal);
    saveEvidence('T07', {
      observedAtUtc: new Date().toISOString(),
      dataStatus: records.status, metadataStatus: metadata.status,
      dataContentType: records.contentType, metadataContentType: metadata.contentType,
      dataTotal, metadataTotal,
    });
  });

  test('T08 Unknown tree ID', async ({ request }) => {
    const result = await getJson(request, recordsQuery({
      where: "com_id = '999999999'",
      limit: 1,
    }));
    expect(result.status).toBe(200);
    const data = result.body as TreeResponse;
    expect(data.total_count).toBe(0);
    expect(data.results).toEqual([]);
    saveEvidence('T08', {
      status: result.status, contentType: result.contentType,
      totalCount: data.total_count, returnedRows: data.results.length,
      results: data.results,
    });
  });
});

test.describe('Input limits and invalid fields', () => {
  for (const item of boundaryCases) {
    test(`T05 Page-size boundary ${item.name}`, async ({ request }) => {
      const result = await getJson(request, recordsQuery({ limit: item.limit }));
      expect(result.status).toBe(item.expectedStatus);
      if (item.limit === 100) {
        const rows = (result.body as TreeResponse).results;
        expect(Array.isArray(rows)).toBe(true);
        expect(rows.length).toBeGreaterThan(0);
        expect(rows.length).toBeLessThanOrEqual(100);
        saveEvidence('T05', {
          inputLimit: item.limit, providerMaximum: 100,
          status: result.status, contentType: result.contentType,
          returnedRows: rows.length,
        });
      } else {
        const message = String(result.body.message ?? '');
        expect(message).toMatch(/limit/i);
        saveEvidence('T05', {
          inputLimit: item.limit, providerMaximum: 100,
          status: result.status, contentType: result.contentType,
          errorMessage: message, errorBody: result.body,
        });
      }
    });
  }

  for (const item of [
    { name: 'where', query: { where: `${unknownField} = 1`, limit: 1 } },
    { name: 'order_by', query: { order_by: unknownField, limit: 1 } },
  ]) {
    test(`T06 Invalid query field in ${item.name}`, async ({ request }) => {
      const result = await getJson(request, recordsQuery(item.query));
      expect(result.status).toBe(400);
      const message = String(result.body.message ?? '');
      expect(message.length).toBeGreaterThan(0);
      expect(message.includes(unknownField) || message.includes(item.name)).toBe(true);
      saveEvidence('T06', {
        clause: item.name, invalidField: unknownField,
        status: result.status, contentType: result.contentType,
        errorMessage: message, errorBody: result.body,
      });
    });
  }
});
