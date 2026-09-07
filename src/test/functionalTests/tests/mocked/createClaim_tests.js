const steps = require('../../citizenFeatures/createClaim/steps/createLipvLipClaimSteps');

Feature('Reduced-stack | Create claim').tag('@reduced-stack @reduced-stack-create-claim @mocked-functional');

const createAndSubmitClaim = async (I, changePartyDetails = () => Promise.resolve(), claimantPartyType = 'Individual') => {
  await I.amOnPage('/testing-support/create-draft-claim');
  await I.click('Create Draft Claim');
  await I.amOnPage('/claim/task-list');
  await I.waitForContent('Prepare your claim', 10);
  await changePartyDetails();

  const caseReference = await steps.checkAndSubmit(false, claimantPartyType);

  await I.see('Claim submitted', 'h1');
  await I.see('1111-2222-3333-4444');
  if (caseReference !== '1111222233334444') {
    throw new Error(`Expected mocked claim reference 1111222233334444, received ${caseReference}`);
  }
};

Scenario('Individual creates and submits a claim without the full Civil stack', async ({I}) => {
  await createAndSubmitClaim(I);
}).tag('@reduced-stack @reduced-stack-create-claim @mocked-functional');

Scenario('Company creates and submits a claim against an individual', async ({I}) => {
  await createAndSubmitClaim(I, async () => steps.addCompanyClaimant(), 'Company');
}).tag('@reduced-stack @reduced-stack-create-claim @mocked-functional');

Scenario('Company creates and submits a claim against an organisation', async ({I}) => {
  await createAndSubmitClaim(I, async () => {
    await steps.addCompanyClaimant();
    await steps.addOrgDefendant();
  }, 'Company');
}).tag('@reduced-stack @reduced-stack-create-claim @mocked-functional');

Scenario('Individual creates and submits a claim against a company', async ({I}) => {
  await createAndSubmitClaim(I, async () => steps.addCompanyDefendant());
}).tag('@reduced-stack @reduced-stack-create-claim @mocked-functional');

Scenario('Organisation creates and submits a claim against a sole trader', async ({I}) => {
  await createAndSubmitClaim(I, async () => {
    await steps.addOrgClaimant();
    await steps.addSoleTraderDefendant();
  }, 'Org');
}).tag('@reduced-stack @reduced-stack-create-claim @mocked-functional');

Scenario('Sole trader creates and submits a claim against an individual', async ({I}) => {
  await createAndSubmitClaim(I, async () => steps.addSoleTraderClaimant());
}).tag('@reduced-stack @reduced-stack-create-claim @mocked-functional');
