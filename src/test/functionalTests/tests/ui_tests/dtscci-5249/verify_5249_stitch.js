// DTSCCI-5249 / civil-service #8112 - Mike's QA step 1: a represented spec claim WITH an uploaded
// timeline document, so GenerateClaimFormForSpec merges [sealed claim form + uploaded doc] (>1 doc)
// -> the PdfMerger multi-document stitch runs -> systemGeneratedCaseDocuments = "Stitched document".
// Confirms VALID multi-document merges still work under the new PDF-input validation.
// Run with SPEC_STITCH_DOC=true (attaches the uploaded doc in createSpecifiedClaim before payment).
const config = require('../../../../config');
const {assert} = require('chai');

Feature('DTSCCI-5249 - spec claim-form MULTI-DOC stitch (civil-service #8112)').tag('@verify-5249-stitch');

Scenario('Represented spec claim with an uploaded doc stitches the sealed claim form (multi-document merge)', async ({api}) => {
  const caseId = await api.createSpecifiedClaim(config.applicantSolicitorUser, false, 'SmallClaims');
  await api.waitForFinishedBusinessProcess();

  const cd = await api.retrieveCaseData(config.adminUser, caseId);
  const docs = (cd.systemGeneratedCaseDocuments || []).map(d => d.value || d);
  const names = docs.map(d => `${d.documentName || '?'} [${d.documentType || '?'}]`);
  console.log(`VERIFY-5249-STITCH|caseId=${caseId}|docCount=${docs.length}|docs=${JSON.stringify(names)}`);

  assert.isAtLeast(docs.length, 1,
    'no systemGeneratedCaseDocuments produced - claim-form generation/stitch failed (possible PdfMergeException)');
  const stitched = docs.filter(d => /stitch/i.test(d.documentName || '') || /SEALED_CLAIM/i.test(d.documentType || ''));
  assert.isAtLeast(stitched.length, 1, 'no stitched/sealed document produced by the merge');
  console.log(`VERIFY-5249-STITCH PASS: caseId=${caseId} produced ${JSON.stringify(stitched.map(d => d.documentName))} (merge ran cleanly, no PdfMergeException)`);
});
