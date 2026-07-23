const steps = require('../../citizenFeatures/createClaim/steps/createLipvLipClaimSteps');

Feature('WireMock-backed create claim').tag('@mocked-functional');

Scenario('Individual creates and submits a claim without the full Civil stack', async ({I}) => {
  await I.amOnPage('/testing-support/create-draft-claim');
  await I.click('Create Draft Claim');
  await I.amOnPage('/claim/task-list');
  await I.waitForContent('Prepare your claim', 10);

  const caseReference = await steps.CreateClaimCreation(false, false);

  await I.see('Claim submitted', 'h1');
  await I.see('1111-2222-3333-4444');
  if (!caseReference.includes('1111-2222-3333-4444')) {
    throw new Error(`Expected mocked claim reference 1111-2222-3333-4444, received ${caseReference}`);
  }
}).tag('@mocked-functional');
