# Melbourne Urban Forest API test plan

**Prepared by** Darvin Anorma Mangampo

**Project** Melbourne Urban Forest tree data API  
**Planning began** 12 October 2026  
**Plan prepared** 13 October 2026  
**Author's context** I completed The Test Tribe Playwright course on 7 September 2026. I started this public API project as part of my upskilling to apply those lessons, separate from the work I did in my previous role.

## Purpose and scope

A consumer of Melbourne's Urban Forest data should be able to move between small pages, filter by genus, look up one of those trees again by `com_id`, and see the same unfiltered tree total in the API response and dataset metadata. This project checks those behaviours through the City of Melbourne Explore API v2.1 using GET requests. The website interface, data-changing operations, load and security testing, and other datasets are outside the scope of this project.

No client requirements were supplied for this project. The published API reference supports the documented response and query expectations. I use comparisons within the same run for lookup, filter and total checks. Those comparisons do not establish whether the underlying tree inventory is accurate.

## Test approach and evidence

The [eight-condition matrix](test-matrix.md) sets out the automated checks. T05 and T06 each contain two cases, so the eight conditions should appear as about ten executions in Playwright's HTML report. The suite will use Playwright's request fixture, direct GET calls and explicit `expect` assertions. Related checks will be grouped. The cases cover valid responses, an unused tree ID, invalid fields and the `100`/`101` page-size pair.

During each run, the suite will use a current `com_id` and a populated genus returned by the API. It will not hard-code the tree total. Both sampled pages must contain five rows in the expected order, and the genus filter must return at least one matching row. Each matrix row explains why the result matters and whether its expected behaviour comes from provider documentation, the dated preflight or a stated comparison rule. If a result differs from a matrix expectation, I check the request, the source of that expectation and the current data. If the difference remains, I record the response, run date and relevant documentation as an observation. A difference from a preflight-only observation is not a confirmed defect.

## Environment and completion criteria

**Environment and data** Windows with the Node.js and Playwright versions saved in the preflight log and later run summaries. Public read-only requests need no token. Run the tests with one Playwright worker, meaning one test process, and no parallel mode to keep request traffic low. Testing stops on HTTP 403, HTTP 429 or an access challenge.

**Entry confirmed** On 13 October 2026, I used Playwright to make twelve GET requests and received JSON responses. I checked the fields needed by the matrix, matched `com_id` and `genus` in a lookup, saw `limit=100` succeed and `limit=101` return an error, and compared equal tree totals from the data and metadata endpoints. The dated log is kept at `evidence/Milestone-A/preflight-results.json`. The saved log includes comparison flags but not the filtered or second-page row counts. I included row-count checks in T02 and T04.

**Completion** Run all eight conditions, investigate each failure, and retain complete results from two different calendar dates. Save the commands and commit IDs with the results.

## Risks and source material

Public tree data can change between calls, so compare the two totals within the same run. The 13 October preflight returned HTTP 200 when `offset + limit = 10000` and HTTP 400 at `10001`. The provider reference says the sum should be less than 10,000. I kept the difference between the published limit and the response at exactly 10,000 as a dated observation outside the eight automated checks. It is not a confirmed defect. Stop if the service returns a rate limit or access challenge.

The [City of Melbourne dataset page](https://data.melbourne.vic.gov.au/explore/dataset/trees-with-species-and-dimensions-urban-forest/information/) and [Explore API reference](https://help.opendatasoft.com/apis/ods-explore-v2/explore_v2.1.html) supply the API fields, query rules and page limit. Sections 4.1, 4.2.2, 5.1.1 and 5.1.3 of the [ISTQB Foundation Level syllabus](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf) are supplementary references for the black-box checks, single boundary pair, brief plan and entry and exit criteria.
