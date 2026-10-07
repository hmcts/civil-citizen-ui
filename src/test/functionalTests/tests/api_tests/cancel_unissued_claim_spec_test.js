const config = require('../../../config');
const { createAccount } = require('../../specClaimHelpers/api/idamHelper');
const apiRequest = require('../../specClaimHelpers/api/apiRequest');

/**
 * OCCC-271 - data set-up for manually testing "Cancel unissued claim" (LiP v LiP spec claims).
 * Each scenario leaves a claim in PENDING_CASE_ISSUED and logs its reference, so you can log in to CUI as the
 * claimant and use "Cancel unissued claim" from the dashboard.
 *
 * Not tagged for any pipeline suite. Run on demand, e.g.:
 *   npx codeceptjs run --grep '@cancel-unissued-claim-spec' --verbose
 */
const claimant = config.claimantCitizenUser;
const defendant = config.defendantCitizenUser;

const logClaimForManualTest = async (scenario, caseId) => {
  const details = await apiRequest.fetchCaseDetails(config.adminUser, caseId);
  console.log('='.repeat(80));
  console.log(`${scenario}`);
  console.log(`Case reference: ${caseId}`);
  console.log(`Claim number:   ${details.case_data.legacyCaseReference}`);
  console.log(`CCD state:      ${details.state}`);
  console.log(`Log in to CUI as ${claimant.email} and open the claim to cancel it`);
  console.log('='.repeat(80));
  return details;
};

Feature('OCCC-271 Cancel unissued claim - claims pending issue for manual testing').tag('@cancel-unissued-claim-spec');

Before(async () => {
  await createAccount(claimant.email, claimant.password);
  await createAccount(defendant.email, defendant.password);
});

Scenario('Claim fee not paid', async ({ api }) => {
  const caseId = await api.createLiPClaimPendingIssue(claimant);

  const details = await logClaimForManualTest('Claim fee not paid', caseId);

  if (details.state !== 'PENDING_CASE_ISSUED') {
    throw new Error(`Expected PENDING_CASE_ISSUED but was ${details.state}`);
  }
});

Scenario('Awaiting Welsh translation of the claim @1bharat', async ({ api }) => {
  // Claimant chooses Welsh and English; after the fee is paid the claim waits for the translated claim document
  const caseId = await api.createLiPClaim(claimant, 'SmallClaims', false, 'Individual', 'BOTH', true);

  const details = await logClaimForManualTest('Awaiting Welsh translation of the claim', caseId);

  if (details.state !== 'PENDING_CASE_ISSUED') {
    throw new Error(`Expected PENDING_CASE_ISSUED (awaiting translation) but was ${details.state}`);
  }
  if (details.case_data.claimantBilingualLanguagePreference !== 'BOTH') {
    throw new Error('Expected claimantBilingualLanguagePreference to be BOTH');
  }
});

Scenario('Help with Fees application pending @bharat', async ({ api }) => {
  const caseId = await api.createLiPClaimPendingIssue(claimant, 'HWF-A1B-2C3');

  const details = await logClaimForManualTest('Help with Fees application pending', caseId);

  if (details.state !== 'PENDING_CASE_ISSUED') {
    throw new Error(`Expected PENDING_CASE_ISSUED but was ${details.state}`);
  }
  if (details.case_data.helpWithFees?.helpWithFee !== 'Yes' || details.case_data.hwfFeeType !== 'CLAIMISSUED') {
    throw new Error('Expected a pending claim issue Help with Fees application');
  }
});
