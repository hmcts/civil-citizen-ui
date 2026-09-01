// DTSCCI-5249 / civil-service #8112 - verify the spec claim-form stitch still works after the
// PdfMerger PDF-validation change. Represented (LR) spec claim create -> GenerateClaimFormForSpec
// -> PdfMerger.mergeDocuments -> sealed claim form in systemGeneratedCaseDocuments. API-only.
const config = require('../../../../config');
const {assert} = require('chai');

Feature('DTSCCI-5249 - spec claim form stitch (civil-service #8112)').tag('@verify-5249');

Scenario('Represented spec claim generates the sealed claim form (PdfMerger validation - single-doc path)', async ({api}) => {
  const existing = process.env.VERIFY_CASE_ID;
  const caseId = existing || await api.createSpecifiedClaim(config.applicantSolicitorUser, false, 'SmallClaims');
  if (!existing) await api.waitForFinishedBusinessProcess();

  const cd = await api.retrieveCaseData(config.adminUser, caseId);
  const docs = (cd.systemGeneratedCaseDocuments || []).map(d => d.value || d);
  const names = docs.map(d => `${d.documentName || '?'} [${d.documentType || '?'}]`);
  console.log(`VERIFY-5249|caseId=${caseId}|docCount=${docs.length}|docs=${JSON.stringify(names)}`);

  assert.isAtLeast(docs.length, 1,
    'GenerateClaimFormForSpec produced no systemGeneratedCaseDocuments - claim-form generation/stitch failed');
  const claimForm = docs.filter(d =>
    /seal|claim.?form/i.test(d.documentName || '') ||
    /SEALED_CLAIM|CLAIM_FORM|CLAIMANT/i.test(d.documentType || ''));
  console.log(`VERIFY-5249|caseId=${caseId}|claimFormDocs=${claimForm.length}`);
  assert.isAtLeast(claimForm.length, 1,
    'no sealed/claim-form document found in systemGeneratedCaseDocuments');
  console.log(`VERIFY-5249 PASS: represented spec claim ${caseId} stitched the sealed claim form under civil-service #8112`);
});
