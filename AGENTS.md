# AGENTS

## Codeceptjs E2E Tests
- Code related to e2e tests for codeceptjs are contained in the './src/test/functionalTests' folder.
- Configuration lives in codecept.conf.js.
- There are only UI tests contained in the following folder path './src/test/functionalTests/tests/ui_tests'.
- These tests are run in a Jenkins pipeline, there are 3 pipelines: master, PR (preview) and nightly. For the following repos:
    * civil-citizen-ui
 
- For civil-citizen-ui (this repo):
  * For this repo, the jenkins configuration for master and PR pipelines is defined in the 'Jenkinsfile_CNP' and the configuration for the nightly pipeline is defined in the 'Jenkinsfile_nightly'. Both jenkins configurations are defined and maintained by a common pipeline.
  * For the master and PR pipeline there is a 'Functional Test' stage where these tests are run. The tests are run using yarn and the script that is run, defined in the package.json file, is 'test:functional', this runs a shell script and depending on github labels defined on the PR, this command then invokes the following two commands for the master pipeline and preview PR respectively 'test:ui-prod' and 'test:ui-nonprod' which looks for tests in a set of files defined in the './codecept.conf.js' file which have the following tags '@ui-prod' for the master pipeline and '@ui-prod' or '@ui-nonprod' for the PR pipeline.
  * For the nightly pipeline. The tests are run using yarn and the script that is run, defined in the package.json file, is 'test:fullfunctional', this runs a shell script and depending on the env  variables defined, this command then invokes the following commands 'test:ui-nightly-prod' which looks for tests in a set of files defined in the './codecept.conf.js' file which have the following tags '@ui-nightly-prod' or '@ui-prod'.
  * Only tests contained within the folder path './src/test/functionalTests/tests/' are run.


- UI and API tests were written by different developers and automation engineers, so there is a bit of inconsistency in the approach, however you will find that Scenarios within Features fall into two different categories independent and dependent. Independent meaning the entire e2e test is contained within one scenario, which means one Feature may contain multiple e2e tests. Dependent meaning, for the next Scenario to pass the previous scenario must also pass, which means the entire e2e test is contained within a feature.

- Test documentation:
  * For features with independent scenarios, test names can be considered to be scenario titles and the steps can be considered to be the names of any methods that are being called from the following objects:
    - wa
    - api
    - noc
    - qm
  
  * There are some steps in the 'Scenario' that are standalone methods imported from another file (not called from a class object). The methods that start with the following word should be included in the steps:
    - verify

  * For features with dependent scenarios, test names can be considered to be the feature title and the test steps can still be considered to be the names of any methods that are being called from the following objects above in each scenario of the feature.
  * For features with independent and dependent scenarios, steps can also be any class methods where the class name ends with 'Steps'
  * There are methods called from the objects above which should be ignored in the documentation of the e2e test steps these include:
    - .getCaseId
    - .login
    - .setCaseId
    - .signOut
    - .amOnPage
    - .waitForText
    - .wait
    - .navigateToCaseDetails
    - .see
    - .grabCaseNumber
    - .navigateToTab
    - .assertHasEvents
    - .retrieveTaskDetails
    - .validateTaskInfo
    - .completeTaskByUser
    - .retrieveCaseData
    - .click
    - .waitForFinishedBusinessProcess
    - .VerifyClaimOnDashboard

  * Also any methods called from the following objects should be ignored
   - LoginSteps

  * Also any methods called from step objects that start with the word:
    - Verify
    - click
    - fill

  * Some test files contain a 'Before' method which will only be included in test files where the features has Scenarios which are completely independent and runs before each Scenario runs, the test steps that are included in this method should also be included in the test steps for each Scenario/test within metadata of the documentation

  * Some test files contain a 'BeforeSuite' method which will only be included in features which have Scenarios which are dependent and runs before the first scenario runs, the test steps that are included in this method should also be included in the test steps for the Feature/test within the metadata of the documentation

  * Anything in 'AfterSuite' should be ignored.

- E2E tests may also contain additional tags which pertain to functional test groups, which are used to only run a set of functional tests in a PR pipeline whenever a particular github label has been added to the PR. In UI tests tags which are functional test group are prefixed with '@ui-{functionalGroup}' and in API tests they are prefixed with '@api-{functionalGroup}'. The corresponding github label is given by 'pr_ft_{functionalGroup}'. The ui functional test groups and api functional test groups are used on the civil-citizen-ui PR pipeline.