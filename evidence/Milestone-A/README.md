# Milestone-A API Access and Test Preparation

- Prepared by: Darvin Anorma Mangampo
- GitHub: [DarvinAnormaMangampo](https://github.com/DarvinAnormaMangampo)
- Assessment period: 12–13 October 2026 (UTC+08:00)

## Purpose and scope

I began by checking whether Playwright could access Melbourne's public Urban Forest API and return fields suitable for testing. A consumer should be able to move through tree data in small pages, filter by genus, look up one of those trees again, and compare the tree total with dataset metadata. The test matrix follows that workflow.

I started this 2026 API testing project as part of my upskilling to apply what I learned in The Test Tribe Playwright course, separate from the work I did in my previous role. The requests use public data without an account or token.

## Basis and limits of the checks

No client requirements were supplied for this project. I used the [Explore API reference](https://help.opendatasoft.com/apis/ods-explore-v2/explore_v2.1.html) for published query rules and response fields, then compared values returned during the same run. Behaviour seen only in the preflight remains a dated observation. These checks cannot establish whether each tree entry matches the physical tree inventory.

## Findings from the 13 October preflight

On 13 October 2026, I used Playwright's API client to send twelve read-only GET requests from my computer, pausing briefly between them. Every response was JSON. Eight requests returned HTTP 200. Four deliberately invalid or out-of-range requests returned HTTP 400. The service did not return HTTP 403, HTTP 429 or an access challenge during this run.

The tree data and metadata endpoints both reported 82,064 trees. A lookup of public `com_id` `1013381` returned the same `com_id` and `genus` (`Ulmus`) as the source row used for the lookup. The log shows no repeated IDs across the two sorted page responses and a true genus-comparison flag. It does not retain the second-page or filtered-result row counts, so those flags alone do not prove both results were populated. I included explicit row-count checks in T02 and T04. `limit=100` succeeded, and `limit=101` returned a JSON error.

I also checked the 10,000 paging limit. The request with `offset + limit = 10000` returned HTTP 200 and 100 rows. The request at `10001` returned HTTP 400. The [Explore API reference](https://help.opendatasoft.com/apis/ods-explore-v2/explore_v2.1.html) says the sum should be less than 10,000. I kept the response at exactly 10,000 as a separate observation because it differs from the published limit. It is not a confirmed provider defect.

## Supporting evidence

- [API Access and Test Preparation Report](Milestone-A%20API%20Access%20and%20Test%20Preparation.pdf) explains the preflight, the test conditions and the limits of the saved results.
- [API test plan](../test-plan.md) states the scope, approach, completion criteria and risks.
- [Eight-condition test matrix](../test-matrix.md) gives the requests, reasons, expected results and evidence basis.
- `scripts/preflight.cjs` contains the API requests I ran.
- `evidence/Milestone-A/preflight-results.json` contains the dated twelve-request log.

## Reproducing the preflight

From the repository root, install the locked dependencies with `pnpm install`, then run `pnpm run preflight`. The script saves a new dated result to `evidence/Milestone-A/preflight-results.json`. Save the previous result first if you need to compare runs. Stop on HTTP 403, HTTP 429 or an access challenge.

## Conclusion

On 13 October, I used Playwright to access the live API and found usable tree fields in the responses. The log's `ready` value describes that dated access check. The saved log omits two row counts, and the tree total may change as Melbourne updates its public dataset.
