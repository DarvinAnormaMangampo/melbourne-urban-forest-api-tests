# Milestone-B API Test Script Development and Baseline Execution

- Prepared by Darvin Anorma Mangampo
- GitHub [DarvinAnormaMangampo](https://github.com/DarvinAnormaMangampo)
- Run date 15 October 2026 (UTC+08:00)
- Test files and saved results commit (after the run): [92c23d4c9fe7b81abb8a05eef51a6dcbc88805b0](https://github.com/DarvinAnormaMangampo/melbourne-urban-forest-api-tests/commit/92c23d4c9fe7b81abb8a05eef51a6dcbc88805b0)

## Purpose and result

In Milestone-A, I confirmed that Playwright could reach Melbourne's Urban Forest API. The saved log showed successful requests for the genus filter and second sorted page, but it did not retain their row counts. For Milestone-B, I checked that both responses contained trees while running the complete Playwright suite based on the [test matrix](../test-matrix.md).

I started this API testing project this year (2026) as part of my upskilling after The Test Tribe Playwright course. It is separate from the work I did in my previous role. The API is a public, read-only service, and no client requirements were supplied for this project.

On 15 October 2026 (UTC+08:00), I ran the Playwright API checks on my computer. I kept this complete T01–T08 result as the baseline evidence described here. Playwright reports ten test executions because two of the eight matrix conditions each have two input cases. T01–T04, T07 and T08 ran once each. T05 checked `limit=100` and `limit=101`. T06 checked an unknown field in `where` and then in `order_by`. **All ten executions passed, and none was skipped.** I used one worker and turned retries off. I configured a 700 ms pause before each of the 13 GET requests. Ten returned HTTP 200. The three deliberately invalid requests returned HTTP 400. The [saved HTML report](html-report/index.html) shows the individual outcomes. The [run summary](baseline-run-summary.json) gives the date, command, tool versions and overall result. I saved the [request and value details](test-evidence.json) separately so the checked sample values can be reviewed.

## What the checks showed

T01 returned HTTP 200 JSON with five rows and a numeric `total_count`. The saved sample has `com_id` 1023218 and genus `Platanus`. Both sorted pages returned five trees. Their `com_id` text values were in ascending order for this sample, with no repeated ID across the ten rows. A lookup for a current tree matched `com_id` 1013381 and genus `Ulmus`. The genus filter returned five `Ulmus` trees, so the filter and second page were both visibly populated in this run.

The `limit=100` request returned 100 rows with HTTP 200. `limit=101` and two invalid-field requests returned HTTP 400 with JSON error messages. The data response and dataset metadata each reported **82,064 trees** during the run. A query for `com_id` `999999999` returned HTTP 200 with `total_count` 0 and no rows. Every assertion in T01–T08 met its matrix expectation during this run. The [findings note](../findings.md) explains what those results support and where their limits lie.

The [saved test evidence](test-evidence.json) includes T01's sample fields and values, the two ordered `com_id` lists and ID sets from T02, and every genus value compared in T04. It also keeps the requests, response statuses and selected response values for all eight conditions. Melbourne [defines `com_id` as text](https://data.melbourne.vic.gov.au/explore/dataset/trees-with-species-and-dimensions-urban-forest/). T02 compared the ten returned IDs as text. They were in ascending order for this sample, but this check does not describe how every possible text ID would sort.

## How I ran the suite

I kept all eight conditions in [one TypeScript test specification](../../tests/urban-forest.api.spec.ts). For the GET calls, I used Playwright's `request` fixture and checked the responses with `expect`. I divided the file into two `test.describe` groups. Tree data and consistency checks come first. The input-limit and invalid-field checks are together in the second group.

Before those checks, I made one read-only request for five trees sorted by `com_id`. I used a row with both `com_id` and `genus` populated for the lookup and genus filter. T01 carries an `@smoke` tag. For T05 I used the [JSON cases](../../test-data/boundary-cases.json) to check the published page-size limit. The first case set `limit=100` at the maximum. The second set `limit=101` just beyond it. In the [runner configuration](../../playwright.config.ts), I set one worker and disabled retries and parallel mode.

That grouping also explains the order in Playwright's report. T07 and T08 belong to the first group, so they appear before T05 and T06.

I ran the suite through Playwright's CLI. The [run summary](baseline-run-summary.json) contains the exact command and source file hashes, including the package file. That package file also defines `pnpm run preflight` for the Milestone-A access check. Run the committed test specification from the repository root with these commands.

```powershell
pnpm install --frozen-lockfile --ignore-scripts
pnpm test
```

I captured Node.js 24.19.0 and Playwright 1.64.0 for this run. pnpm 11.25.0 was available, although I invoked the CLI with Node.js. I ran the suite before committing the Milestone-B files, so the saved summary has no commit ID. I recorded hashes of the source files in that summary. I then committed the test specification, boundary-case JSON, updated Playwright configuration, run summary, test evidence, console output and HTML report in [commit 92c23d4c9fe7b81abb8a05eef51a6dcbc88805b0](https://github.com/DarvinAnormaMangampo/melbourne-urban-forest-api-tests/commit/92c23d4c9fe7b81abb8a05eef51a6dcbc88805b0). I used public access without an account or token. Stop if the service returns HTTP 403 or HTTP 429. Treat an access challenge the same way. A new run writes its HTML report to `playwright-report/`. The [HTML report for the 15 October run](html-report/index.html) shows the individual test outcomes.

## Evidence files

| File | What it shows |
| --- | --- |
| [Milestone-B report](Milestone-B%20API%20Test%20Script%20Development%20and%20Baseline%20Execution.pdf) | Context, result and limits of the 15 October run. |
| [Test specification](../../tests/urban-forest.api.spec.ts) and [JSON cases](../../test-data/boundary-cases.json) | The executable checks and T05's page-size values, `limit=100` and `limit=101`. |
| [Test plan](../test-plan.md) and [test matrix](../test-matrix.md) | Scope and the basis for each expected result, prepared in Milestone-A. |
| [Saved HTML report](html-report/index.html), [run summary](baseline-run-summary.json) and [test evidence](test-evidence.json) | The ten dated test results, command, versions, request details and sample values. |
| [Console output](run-console.txt) | The request, response and value lines captured during execution. |
| [Findings and observations](../findings.md) | What the 15 October responses show and what one run cannot establish. |

## Sources and limits

The [City of Melbourne dataset page](https://data.melbourne.vic.gov.au/explore/dataset/trees-with-species-and-dimensions-urban-forest/information/) and [Explore API reference](https://help.opendatasoft.com/apis/ods-explore-v2/explore_v2.1.html) support the published fields and query rules. In the matrix, P means a published rule and O refers to what I saw during the 13 October preflight. I use R when comparing responses from the same run. I consulted section 1.4.1 of the [ISTQB Foundation Level syllabus](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf) for its description of preparing and running tests. Section 4.2.2 informed the 100/101 page-size pair.

The records and metadata endpoints each reported 82,064 trees on 15 October. Both figures came from the same City dataset, so their agreement shows that the two API responses were consistent during this run. I checked small API responses rather than every tree entry. Matching totals cannot verify the accuracy of individual entries. I did not compare the dataset with a separate tree list because these eight checks focus on API behaviour through a few read-only requests. The run therefore does not establish whether the inventory is complete. The [City dataset page](https://data.melbourne.vic.gov.au/explore/dataset/trees-with-species-and-dimensions-urban-forest/) lists a monthly source-data update frequency, so a later total may differ. For ungrouped records requests, the [Explore API reference](https://help.opendatasoft.com/apis/ods-explore-v2/explore_v2.1.html) limits a page to 100 results, restricts deep paging and points to exports for larger result sets. I did not use an export because inspecting every published entry was outside these eight checks. One passing run does not establish continued availability or reliability.

I kept the 10,000 paging question outside Milestone-B's eight conditions. In Milestone-A, `limit=100` with `offset=9900` returned HTTP 200 and 100 rows. I raised only the offset to 9901 for the next request. It returned HTTP 400 with an error saying that `offset + limit` must be no greater than 10,000. The [City of Melbourne API specification](https://data.melbourne.vic.gov.au/api/explore/v2.1/swagger.json) says the sum should be less than 10,000, yet the service accepted exactly 10,000 in my earlier check.

Milestone-B covered tree data and two nearby five-row pages. T05 checked the different 100/101 page-size boundary. All ten executions passed, but none tested the separate deep-paging boundary where `offset + limit = 10,000`. This run therefore does not resolve the difference observed in Milestone-A between the published guidance and the API response at that boundary.
