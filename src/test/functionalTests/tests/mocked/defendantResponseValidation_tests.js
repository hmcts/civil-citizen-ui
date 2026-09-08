const ResponseSteps = require('../../citizenFeatures/response/steps/lipDefendantResponseSteps');
const BilingualLanguagePreference = require('../../citizenFeatures/response/pages/defendantLipResponse/bilingualLanguagePreference');
const bilingualLanguagePreference = new BilingualLanguagePreference();

const claimRef = '1111222233334444';
const iHaveAlreadyAgreedMoretime = 'iHaveAlreadyAgreedMoretime';
const yesIWantMoretime = 'yesIWantMoretime';
const dontWantMoreTime = 'dontWantMoreTime';
const admitAll = 'full-admission';
const partAdmit = 'partial-admission';
const rejectAll = 'rejectAll';
const bySetDate = 'bySetDate';
const totalClaimAmount = 1000;

Feature('Reduced-stack | Defendant response validation')
  .tag('@reduced-stack @reduced-stack-response @mocked-functional');

Before(async ({I}) => {
  await I.amOnPage('/testing-support/create-draft-claim');
  await I.click('Create Defendant Response Draft');
});

Scenario('Defendant response validation errors are shown without the full Civil stack', async () => {
  await bilingualLanguagePreference.verifyContentError();
  await bilingualLanguagePreference.verifyContent('en');
  await ResponseSteps.EnterPersonalDetails(claimRef);
  await ResponseSteps.EnterYourOptionsForDeadlineError(claimRef, iHaveAlreadyAgreedMoretime);
  await ResponseSteps.EnterYourOptionsForDeadlineError(claimRef, yesIWantMoretime);
  await ResponseSteps.EnterYourOptionsForDeadline(claimRef, dontWantMoreTime);
  await ResponseSteps.EnterResponseToClaimError(claimRef, partAdmit);
  await ResponseSteps.EnterResponseToClaimError(claimRef, rejectAll);
  await ResponseSteps.EnterResponseToClaim(claimRef, partAdmit);
  await ResponseSteps.SelectPartAdmitAlreadyPaid('no');
  await ResponseSteps.EnterHowMuchMoneyYouOweError(claimRef, totalClaimAmount);
  await ResponseSteps.EnterHowMuchMoneyYouOwe(claimRef, 500, partAdmit, totalClaimAmount);
  await ResponseSteps.EnterWhyYouDisagreeTheClaimAmountError(claimRef, partAdmit);
  await ResponseSteps.EnterResponseToClaim(claimRef, admitAll);
  await ResponseSteps.EnterPaymentOption(claimRef, admitAll, bySetDate);
  await ResponseSteps.EnterDateToPayOnError();
  await ResponseSteps.EnterRepaymentPlanError(claimRef);
  await ResponseSteps.EnterResponseToClaim(claimRef, rejectAll);
  await ResponseSteps.SelectOptionInRejectAllClaim('alreadyPaid');
  await ResponseSteps.EnterHowMuchYouHavePaidError(claimRef, 500, rejectAll);
  await ResponseSteps.EnterResponseToClaim(claimRef, partAdmit);
  await ResponseSteps.SelectPartAdmitAlreadyPaid('yes');
  await ResponseSteps.EnterHowMuchYouHavePaidError(claimRef, 500, partAdmit);
}).tag('@reduced-stack @reduced-stack-response @mocked-functional');

Scenario('Defendant personal-detail validation errors are shown without the full Civil stack', async () => {
  await bilingualLanguagePreference.verifyContent('en');
  await ResponseSteps.EnterPersonalDetailsError(claimRef);
}).tag('@reduced-stack @reduced-stack-response @mocked-functional');
