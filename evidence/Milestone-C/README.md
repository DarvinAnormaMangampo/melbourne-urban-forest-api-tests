# Milestone-C Repeat Test Execution and Evidence Finalisation

- Prepared by Darvin Anorma Mangampo
- Repeat run date 16 October 2026 (UTC+08:00)
- Repository commit present during the repeat run [1ed2bc338de6895b618aa82ca5cede3fc4a36e98](https://github.com/DarvinAnormaMangampo/melbourne-urban-forest-api-tests/commit/1ed2bc338de6895b618aa82ca5cede3fc4a36e98)

## Purpose and result

I began this API testing project in 2026 as part of my upskilling after The Test Tribe Playwright course. It is separate from my earlier employment. No client requirements were supplied. The [Milestone-B baseline](../Milestone-B/README.md) contains the result of one complete run of the eight conditions in the [test matrix](../test-matrix.md). On 16 October, I ran those checks again against the live Urban Forest API. In my test plan, I set out two complete runs on different dates. The later run let me see whether the same sampled requests still met their expectations on that date. The five source files used by the checks have matching saved hashes in both runs. That comparison identifies the test code and supporting files used on each date. It compares my files, not the live service. It cannot tell me whether the City changed the API or its tree data in the time between the runs. The Milestone-B source was committed after its run, so its summary correctly has no commit ID at execution. Commit `1ed2bc338de6895b618aa82ca5cede3fc4a36e98` was already present when I ran the suite on 16 October.

I ran all eight matrix conditions on 16 October. When I checked the saved Playwright result, all ten test cases had passed. None failed or was skipped. There are ten cases because T05 and T06 each used two inputs. Each of the other six conditions used one. The suite made 13 read-only GET requests. One request obtained the current tree used for setup. T02 needed two pages, and T07 needed separate data and metadata responses. The other cases used one request each. Ten responses were HTTP 200. The three HTTP 400 responses were expected: one for `limit=101` in T05 and one for each invalid field in T06. Those cases passed because the error content matched the assertions, not because the server accepted the invalid inputs. No HTTP 403, HTTP 429 or access challenge interrupted the run. The [HTML report](html-report/index.html) shows each outcome. The [saved test evidence](test-evidence.json) holds the requests and values checked.

## What the repeat run showed

I compared the [Milestone-B test evidence](../Milestone-B/test-evidence.json) with the [Milestone-C test evidence](test-evidence.json). All 13 saved request paths and response summaries matched, including the statuses and selected values. The results below are the separate 16 October observations, even though their saved values match the baseline.

T01 checked a five-row response and saved a sample with `com_id` 1023218 and genus `Platanus`. The setup request separately selected a tree with `com_id` 1013381 and genus `Ulmus` for T03 and T04. They are different sampled rows from the live dataset, so their genus values need not match. The first two `com_id`-ordered pages each contained five rows. Their ten text IDs were ascending within and across the pages, with no repeated ID. A lookup returned the same `com_id` and genus as the source row. The filter returned five rows, all with genus `Ulmus`.

The request with `limit=100` returned 100 rows and HTTP 200. The request with `limit=101` returned HTTP 400 JSON with a limit error. Unknown fields in `where` and `order_by` each produced an HTTP 400 JSON error that named the invalid field and clause. T07 compared a fresh unfiltered data response with dataset metadata during this run. Both reported **82,064** trees. An unused `com_id` returned HTTP 200 with zero results. These are the values the API returned on 16 October. I dated them because the City can update its published tree data. A later request could return different rows or a different total.

The [detailed evidence](test-evidence.json) keeps the fields sampled in T01 and both ID lists and sets checked in T02. It also holds the T03 lookup values, every genus compared in T04, and the separate responses for both T05 and T06 cases. T07's two totals and observation time are saved there, along with T08's empty response. The [shared run summary](../run-summary.md) compares the two dated results and explains their source identities. The [findings log](../findings.md) discusses what the responses can and cannot establish.

## How to run the checks

From the repository root, install the locked dependencies and run the suite:

```powershell
pnpm install --frozen-lockfile --ignore-scripts
pnpm test
```

The checks are in [one TypeScript specification](../../tests/urban-forest.api.spec.ts). T05 reads its two page-size values from the [JSON cases](../../test-data/boundary-cases.json). The [Playwright configuration](../../playwright.config.ts) uses one worker, no parallel mode and no retries. The test code pauses 700 ms before each GET. Stop if the service signals a rate limit or access challenge. The [16 October run summary](repeat-run-summary.json) lists the actual command, tool versions, commit present during the run and outcome of each test case. A fresh run can return different values because the dataset is live.

## Evidence files

| File | What it contains |
| --- | --- |
| [Milestone-C report](Milestone-C%20Repeat%20Test%20Execution%20and%20Evidence%20Finalisation.pdf) | The report comparing the two dated runs and their limits. |
| [HTML report](html-report/index.html) | The ten individual Playwright outcomes from 16 October. |
| [Run summary](repeat-run-summary.json) | Date, actual command, versions, source hashes, commit ID and ten test-case outcomes. |
| [Test evidence](test-evidence.json) | The saved requests, response summaries and matrix values for T01–T08. |
| [Console output](run-console.txt) | The request, response and value lines captured during execution. |
| [Test plan](../test-plan.md) and [test matrix](../test-matrix.md) | Scope, expected results and the P, O and R bases. |
| [Findings and observations](../findings.md) | Interpretation of both dated results and remaining limits. |

## Public access to the evidence

I checked the published links on 19 October 2026 because I wanted the earlier planning evidence and the Milestone-B result behind my comparison to be accessible. I opened the links in the published Milestone-A README and PDF report. I then did the same for the Milestone-B README and report. I also checked every link in the published test plan, test matrix and findings note. The linked GitHub files and external sources opened when I checked them.

GitHub displayed the saved Milestone-B HTML report as a file page instead of an interactive Playwright report. The file opened. To inspect its interactive view, it needs to be downloaded and opened locally.

Before uploading the Milestone-C files, I checked the links in this README against their intended repository paths. The links are designed to work on GitHub once those files are uploaded.

## Sources and limits

The HTML report shows the outcome of each of the ten Playwright cases. I saved the requests and response values listed in the matrix because they show what each assertion checked on 16 October. The detailed test evidence includes both ordered T02 ID lists and every genus value compared in T04. It also keeps the separate T05 and T06 error responses.

The [City dataset page](https://data.melbourne.vic.gov.au/explore/dataset/trees-with-species-and-dimensions-urban-forest/information/) supplied the published tree fields. The [Explore API reference](https://help.opendatasoft.com/apis/ods-explore-v2/explore_v2.1.html) supplied the query and page-size rules used in the [test matrix](../test-matrix.md). I used [ISTQB Foundation Level sections 1.4.1 and 5.1.3](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf) as supplementary references when reviewing the test activities, saved results and the [test plan's](../test-plan.md) completion criteria. I set the two-date requirement in that plan for this project. The City's API rules and the values returned during each run remain the basis for the assertions.

Matching source hashes show that the five tested files did not change. I ran the same eight Playwright checks on 16 October because I wanted to see whether they still met their matrix expectations on another date. The test code sent the API requests during that run. I did not start that run to assess the effect of an identified change to the City’s API. The [ISTQB Foundation Level syllabus](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf) describes regression testing as checking for adverse effects caused by a change. I describe my work as repeat execution because I compared results on two dates without testing the effect of a defined change.

I chose two dated runs in my test plan because the first passing result showed only how the API responded on 15 October. I ran the full suite again on 16 October. I did not monitor the API between those runs because my question was whether the same eight checks passed on each date. An interruption between the runs would not appear in either HTML report. The two passes therefore cannot establish continuous availability.

Both totals came from the same City dataset. Their agreement shows that the two API responses matched during the run. It is not an independent count of physical trees.

I checked small responses because the eight conditions focused on how someone retrieves and queries tree data through the API. I did not use an export because the eight conditions checked selected API responses. An export would help with a separate review of the published list, but it would not by itself verify that list against every physical tree. The Explore API reference caps an ordinary ungrouped page at 100 results and points to exports for larger retrieval.

I also did not compare the API data with a separate tree inventory because checking the completeness and accuracy of that inventory was outside these eight conditions. Two responses from the same dataset could agree even if an entry were missing or incorrect. The matching totals therefore cannot establish whether the list is complete or every entry is correct.

During the 13 October Milestone-A preflight, I checked deep paging with limit=100 and offset=9900. Their sum was 10,000. The API returned HTTP 200 and 100 rows, although the published guidance says the sum should be less than 10,000. When I increased the offset to 9901, the API returned HTTP 400.

The difference between the published guidance and the response at 10,000 made me wonder how the API applies its deep-paging limit. I did not add a check for that question to T01–T08 because I had defined those conditions around the first two pages and the maximum size of one page. I ran those same eight conditions on 15 and 16 October. T02 used offsets 0 and 5. T05 tested page sizes 100 and 101 without using offset 9900. Because none of those requests reached the 10,000 boundary, their passing results cannot establish how the API would respond to limit=100 with offset=9900. The HTTP 200 saved on 13 October is the only response I have for that exact request. I keep its difference from the published guidance as a dated observation. All eight automated conditions met their expected results on 16 October.
