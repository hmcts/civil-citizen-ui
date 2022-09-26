// in this file you can append custom step methods to 'I' object

const output = require('codeceptjs').output;

const config = require('./config.js');
const parties = require('./helpers/party.js');
const loginPage = require('./pages/login.page');
const caseViewPage = require('./pages/caseView.page');
const solicitorReferencesPage = require('./pages/createClaim/solicitorReferences.page');
const claimantSolicitorOrganisationLRspec = require('./pages/createClaim/claimantSolicitorOrganisationLRspec.page');
const addAnotherClaimant = require('./pages/createClaim/addAnotherClaimant.page');
const claimantSolicitorIdamDetailsPage = require('./pages/createClaim/idamEmail.page');
const defendantSolicitorOrganisationLRspec = require('./pages/createClaim/defendantSolicitorOrganisationLRspec.page');
const defendantSolicitorOrganisation = require('./pages/createClaim/defendantSolicitorOrganisation.page');
const addAnotherDefendant = require('./pages/createClaim/addAnotherDefendant.page');
const respondent2SameLegalRepresentative = require('./pages/createClaim/respondent2SameLegalRepresentative.page');
const extensionDatePage = require('./pages/informAgreedExtensionDate/date.page');
const detailsOfClaimPage = require('./pages/createClaim/detailsOfClaim.page');
const pbaNumberPage = require('./pages/createClaim/pbaNumber.page');
const paymentReferencePage = require('./pages/createClaim/paymentReference.page');
const statementOfTruth = require('./fragments/statementOfTruth');
const party = require('./fragments/party');
const event = require('./fragments/event');
const proceedPage = require('./pages/respondToDefence/proceed.page');

// DQ fragments
const fileDirectionsQuestionnairePage = require('./fragments/dq/fileDirectionsQuestionnaire.page');
const disclosureOfElectronicDocumentsPage = require('./fragments/dq/disclosureOfElectrionicDocuments.page');
const expertsPage = require('./fragments/dq/experts.page');
const singleResponse = require('./pages/respondToClaimLRspec/singleResponseLRSpec.page.js');
const hearingSupportRequirementsPage = require('./fragments/dq/hearingSupportRequirements.page');
const welshLanguageRequirementsPage = require('./fragments/dq/language.page');
const address = require('./fixtures/address.js');
const specCreateCasePage = require('./pages/createClaim/createCaseLRspec.page');
const specParty = require('./fragments/partyLRspec');
const specClaimantLRPostalAddress = require('./fixtures/claimantLRPostalAddressLRspec');
const specRespondentRepresentedPage = require('./pages/createClaim/isRespondentRepresentedLRspec.page');
const specDefendantSolicitorEmailPage = require('./pages/createClaim/defendantSolicitorEmailLRspec.page');
const specDefendantLRPostalAddress = require('./fixtures/defendantLRPostalAddressLRspec');
const specTimelinePage = require('./pages/createClaim/claimTimelineLRspec.page');
const specAddTimelinePage = require('./pages/createClaim/addTimelineLRspec.page');
const specListEvidencePage = require('./pages/createClaim/claimListEvidenceLRspec.page');
const specClaimAmountPage = require('./pages/createClaim/claimAmountLRspec.page');
const specInterestPage = require('./pages/createClaim/interestLRspec.page');
const specInterestValuePage = require('./pages/createClaim/interestValueLRspec.page');
const specInterestRatePage = require('./pages/createClaim/interestRateLRspec.page');
const specInterestDateStartPage = require('./pages/createClaim/interestDateStartLRspec.page');
const specInterestDateEndPage = require('./pages/createClaim/interestDateEndLRspec.page');
const specConfirmDefendantsDetails = require('./fragments/confirmDefendantsDetailsLRspec');
const specConfirmLegalRepDetails = require('./fragments/confirmLegalRepDetailsLRspec');
const responseTypeSpecPage = require('./pages/respondToClaimLRspec/responseTypeLRspec.page');
const defenceTypePage = require('./pages/respondToClaimLRspec/defenceTypeLRspec.page');
const fullAdmitTypeLRspecPage = require('./pages/respondToClaimLRspec/fullAdmitTypeLRspec.page');
const partAdmittedAmountPage = require('./pages/respondToClaimLRspec/partAdmitTypeLRspec.page');
const freeMediationPage = require('./pages/respondToClaimLRspec/freeMediationLRspec.page');
const chooseCourtSpecPage = require('./pages/respondToClaimLRspec/chooseCourtLRspec.page');
const smallClaimsHearingPage = require('./pages/respondToClaimLRspec/hearingSmallClaimsLRspec.page');
const useExpertPage = require('./pages/respondToClaimLRspec/useExpertLRspec.page');
const respondentCheckListPage = require('./pages/respondToClaimLRspec/respondentCheckListLRspec.page');
const enterWitnessesPage = require('./pages/respondToClaimLRspec/enterWitnessesLRspec.page');
const disputeClaimDetailsPage = require('./pages/respondToClaimLRspec/disputeClaimDetailsLRspec.page');
const claimResponseTimelineLRspecPage = require('./pages/respondToClaimLRspec/claimResponseTimelineLRspec.page');
const hearingLRspecPage = require('./pages/respondToClaimLRspec/hearingLRspec.page');
const hearingClaimantLRspecPage = require('./pages/respondToClaimLRspec/hearingClaimantLRspec.page');
const furtherInformationLRspecPage = require('./pages/respondToClaimLRspec/furtherInformationLRspec.page');
const disclosureReportPage = require('./fragments/dq/disclosureReport.page');
const admitPartPaymentRoutePage = require('./pages/respondToClaimLRspec/admitPartPaymentRoute.page');
const respondentHomeDetailsLRspecPage = require('./pages/respondToClaimLRspec/respondentHomeDetailsLRspec.page');
const respondentEmploymentTypePage = require('./pages/respondToClaimLRspec/respondentEmploymentType.page');
const respondentCourtOrderTypePage = require('./pages/respondToClaimLRspec/respondentCourtOrderType.page');
const respondentDebtsDetailsPage = require('./pages/respondToClaimLRspec/respondentDebtsDetails.page');
const respondentIncomeExpensesDetailsPage = require('./pages/respondToClaimLRspec/respondentIncomeExpensesDetails.page');
const respondentCarerAllowanceDetailsPage = require('./pages/respondToClaimLRspec/respondentCarerAllowanceDetails.page');
const respondentRepaymentPlanPage = require('./pages/respondToClaimLRspec/respondentRepaymentPlan.page');
const respondentPage = require('./pages/respondToClaimLRspec/respondentWhyNotPay.page');
const respondent2SameLegalRepresentativeLRspec = require('./pages/createClaim/respondent2SameLegalRepresentativeLRspec.page');
const vulnerabilityPage = require('./pages/respondToClaimLRspec/vulnerabilityLRspec.page');
const vulnerabilityQuestionsPage = require('./fragments/dq/vulnerabilityQuestions.page');
const enterBreathingSpacePage = require('./pages/respondToClaimLRspec/enterBreathingSpace.page');
const liftBreathingSpacePage = require('./pages/respondToClaimLRspec/liftBreathingSpace.page');
const witnessesLRspecPage = require('./pages/respondToClaimLRspec/witnessesLRspec.page.js');
const caseProceedsInCasemanPage = require('./pages/caseProceedsInCaseman/caseProceedsInCaseman.page');
const {takeCaseOffline} = require('./pages/caseProceedsInCaseman/takeCaseOffline.page');

const SIGNED_IN_SELECTOR = 'exui-header';
const SIGNED_OUT_SELECTOR = '#global-header';
const CASE_HEADER = 'ccd-case-header > h1';

const CONFIRMATION_MESSAGE = {
  online: 'Your claim has been received\nClaim number: ',
  offline: 'Your claim has been received and will progress offline',
};

let caseId, screenshotNumber, eventName, currentEventName;
let eventNumber = 0;
const getScreenshotName = () => eventNumber + '.' + screenshotNumber + '.' + eventName.split(' ').join('_') + '.png';
const conditionalSteps = (condition, steps) => condition ? steps : [];

const firstClaimantSteps = () => [
  () => party.enterParty(parties.APPLICANT_SOLICITOR_1, address),
];

const secondClaimantSteps = (claimant2) => [
  () => addAnotherClaimant.enterAddAnotherClaimant(claimant2),

  ...conditionalSteps(claimant2, [
    () => party.enterParty(parties.APPLICANT_SOLICITOR_2, address),
  ]),

  () => claimantSolicitorIdamDetailsPage.enterUserEmail(),
  () => claimantSolicitorOrganisationLRspec.enterOrganisationDetails(),
  () => specParty.enterSpecParty('Applicant', specClaimantLRPostalAddress),
  () => party.enterParty('respondent1', address),
];

const firstDefendantSteps = (respondent1) => [
  () => specRespondentRepresentedPage.enterRespondentRepresented('yes'),
  () => defendantSolicitorOrganisation.enterOrganisationDetails(respondent1.representativeRegistered, '1', respondent1.representativeOrgNumber),
  () => specDefendantSolicitorEmailPage.enterSolicitorEmail('1'),
  () => specParty.enterSpecParty('Respondent', specDefendantLRPostalAddress),

];

const secondDefendantSteps = (respondent2, respondent1Represented) => [
  ...conditionalSteps(respondent2, [
    () => party.enterParty('respondent2', address),
    () => respondent2SameLegalRepresentativeLRspec.enterRespondent2SameLegalRepresentative(parties.RESPONDENT_SOLICITOR_2, respondent2.represented),
    ...conditionalSteps(respondent2 && respondent2.represented, [
      ...conditionalSteps(respondent1Represented, [
        () => respondent2SameLegalRepresentative.enterRespondent2SameLegalRepresentative(respondent2.sameLegalRepresentativeAsRespondent1),
      ]),
      ...conditionalSteps(respondent2 && !respondent2.sameLegalRepresentativeAsRespondent1, [
        () => defendantSolicitorOrganisationLRspec.enterOrganisationDetails('respondent2'),
        () => specDefendantSolicitorEmailPage.enterSolicitorEmail('2'),

      ]),
    ]),
  ]),
];

module.exports = function () {
  return actor({
    // Define custom steps here, use 'this' to access default methods of I.

    // It is recommended to place a general 'login' function here.
    async login(user) {
      if (await this.hasSelector(SIGNED_IN_SELECTOR)) {
        await this.signOut();
      }

      await this.retryUntilExists(async () => {
        this.amOnPage(config.url.manageCase, 90);

        if (!config.idamStub.enabled || config.idamStub.enabled === 'false') {
          output.log(`Signing in user: ${user.type}`);
          await loginPage.signIn(user);
        }
      }, SIGNED_IN_SELECTOR);
    },

    grabCaseNumber: async function () {
      this.waitForElement(CASE_HEADER);

      return await this.grabTextFrom(CASE_HEADER);
    },

    async signOut() {
      await this.retryUntilExists(() => {
        this.click('Sign out');
      }, SIGNED_OUT_SELECTOR);
    },

    async takeScreenshot() {
      if (currentEventName !== eventName) {
        currentEventName = eventName;
        eventNumber++;
        screenshotNumber = 0;
      }
      screenshotNumber++;
      await this.saveScreenshot(getScreenshotName(), true);
    },

    triggerStepsWithScreenshot: async function (steps) {
      for (let i = 0; i < steps.length; i++) {
        try {
          await this.takeScreenshot();
        } catch {
          output.log(`Error taking screenshot: ${getScreenshotName()}`);
        }
        await steps[i]();
      }
    },

    async assertNoEventsAvailable() {
      await caseViewPage.assertNoEventsAvailable();
    },

    async clickContinue() {
      let urlBefore = await this.grabCurrentUrl();
      await this.retryUntilUrlChanges(() => this.click('Continue'), urlBefore);
    },

    /**
     * Retries defined action util element described by the locator is invisible. If element is not invisible
     * after 4 tries (run + 3 retries) this step throws an error. Use cases include checking no error present on page.
     *
     * Warning: action logic should avoid framework steps that stop test execution upon step failure as it will
     *          stop test execution even if there are retries still available. Catching step error does not help.
     *
     * @param action - an action that will be retried until either condition is met or max number of retries is reached
     * @param locator - locator for an element that is expected to be invisible upon successful execution of an action
     * @param maxNumberOfRetries - maximum number to retry the function for before failing
     * @returns {Promise<void>} - promise holding no result if resolved or error if rejected
     */
    async retryUntilInvisible(action, locator, maxNumberOfRetries = 3) {
      for (let tryNumber = 1; tryNumber <= maxNumberOfRetries; tryNumber++) {
        output.log(`retryUntilInvisible(${locator}): starting try #${tryNumber}`);
        await action();

        if (await this.hasSelector(locator) > 0) {
          output.print(`retryUntilInvisible(${locator}): error present after try #${tryNumber} was executed`);
        } else {
          output.log(`retryUntilInvisible(${locator}): error not present after try #${tryNumber} was executed`);
          break;
        }
        if (tryNumber === maxNumberOfRetries) {
          throw new Error(`Maximum number of tries (${maxNumberOfRetries}) has been reached in search for ${locator}`);
        }
      }
    },

    async addAnotherElementToCollection() {
      const numberOfElements = await this.grabNumberOfVisibleElements('.collection-title');
      this.click('Add new');
      this.waitNumberOfVisibleElements('.collection-title', numberOfElements + 1);
    },

    /**
     * Retries defined action util element described by the locator is present. If element is not present
     * after 4 tries (run + 3 retries) this step throws an error.
     *
     * Warning: action logic should avoid framework steps that stop test execution upon step failure as it will
     *          stop test execution even if there are retries still available. Catching step error does not help.
     *
     * @param action - an action that will be retried until either condition is met or max number of retries is reached
     * @param locator - locator for an element that is expected to be present upon successful execution of an action
     * @param maxNumberOfTries - maximum number to retry the function for before failing
     * @returns {Promise<void>} - promise holding no result if resolved or error if rejected
     */
    async retryUntilExists(action, locator, maxNumberOfTries = 6) {
      for (let tryNumber = 1; tryNumber <= maxNumberOfTries; tryNumber++) {
        output.log(`retryUntilExists(${locator}): starting try #${tryNumber}`);
        if (tryNumber > 1 && await this.hasSelector(locator)) {
          output.log(`retryUntilExists(${locator}): element found before try #${tryNumber} was executed`);
          break;
        }
        await action();
        if (await this.waitForSelector(locator) != null) {
          output.log(`retryUntilExists(${locator}): element found after try #${tryNumber} was executed`);
          break;
        } else {
          output.print(`retryUntilExists(${locator}): element not found after try #${tryNumber} was executed`);
        }
        if (tryNumber === maxNumberOfTries) {
          throw new Error(`Maximum number of tries (${maxNumberOfTries}) has been reached in search for ${locator}`);
        }
      }
    },

    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    },

    /**
     * Retries defined action util url is changed by given action. If url does not change
     * after 4 tries (run + 3 retries) this step throws an error. If url is already changed, will exit.
     *
     * Warning: action logic should avoid framework steps that stop test execution upon step failure as it will
     *          stop test execution even if there are retries still available. Catching step error does not help.
     *
     * @param action - an action that will be retried until either condition is met or max number of retries is reached
     * @param urlBefore - the url before the action has occurred
     * @param maxNumberOfTries - maximum number to retry the function for before failing
     * @returns {Promise<void>} - promise holding no result if resolved or error if rejected
     */
    async retryUntilUrlChanges(action, urlBefore, maxNumberOfTries = 6) {
      let urlAfter;
      for (let tryNumber = 1; tryNumber <= maxNumberOfTries; tryNumber++) {
        output.log(`Checking if URL has changed, starting try #${tryNumber}`);
        await action();
        await this.sleep(3000 * tryNumber);
        urlAfter = await this.grabCurrentUrl();
        if (urlBefore !== urlAfter) {
          output.log(`retryUntilUrlChanges(before: ${urlBefore}, after: ${urlAfter}): url changed after try #${tryNumber} was executed`);
          break;
        } else {
          output.print(`retryUntilUrlChanges(before: ${urlBefore}, after: ${urlAfter}): url did not change after try #${tryNumber} was executed`);
        }
        if (tryNumber === maxNumberOfTries) {
          throw new Error(`Maximum number of tries (${maxNumberOfTries}) has been reached trying to change urls. Before: ${urlBefore}. After: ${urlAfter}`);
        }
      }
    },

    async createCaseSpecified(mpScenario, claimant1, claimant2, respondent1, respondent2, claimAmount) {
      eventName = 'Create claim - Specified';

      //const twoVOneScenario = claimant1 && claimant2;
      await specCreateCasePage.createCaseSpecified(config.definition.jurisdiction);
      await this.triggerStepsWithScreenshot([
        () => this.clickContinue(),
        () => this.clickContinue(),
        () => solicitorReferencesPage.enterReferences(),
        ...firstClaimantSteps(),
        ...secondClaimantSteps(claimant2),
        ...firstDefendantSteps(respondent1),
        ...conditionalSteps(claimant2 == null, [
          () =>  addAnotherDefendant.enterAddAnotherDefendant(respondent2),
        ]),
        ...secondDefendantSteps(respondent2, respondent1.represented),
        () => detailsOfClaimPage.enterDetailsOfClaim(mpScenario),
        () => specTimelinePage.addManually(),
        () => specAddTimelinePage.addTimeline(),
        () => specListEvidencePage.addEvidence(),
        () => specClaimAmountPage.addClaimItem(claimAmount),
        () => this.clickContinue(),
        () => specInterestPage.addInterest(),
        () => specInterestValuePage.selectInterest(),
        () => specInterestRatePage.selectInterestRate(),
        () => specInterestDateStartPage.selectInterestDateStart(),
        () => specInterestDateEndPage.selectInterestDateEnd(),
        () => this.clickContinue(),
        () => pbaNumberPage.selectPbaNumber(),
        () => paymentReferencePage.updatePaymentReference(),
        () => statementOfTruth.enterNameAndRole('claim'),
        () => event.submit('Submit',CONFIRMATION_MESSAGE.online),
        () => event.returnToCaseDetails(),
      ]);

      caseId = (await this.grabCaseNumber()).split('-').join('').substring(1);
    },

    async informAgreedExtensionDateSpec(respondentSolicitorNumber = '1') {
      eventName = 'Inform agreed extension date';
      await this.triggerStepsWithScreenshot([
        () => caseViewPage.startEvent(eventName, caseId),
        () => extensionDatePage.enterExtensionDate(respondentSolicitorNumber),
        () => event.submit('Submit', ''),
        () => event.returnToCaseDetails(),
      ]);
    },

    async enterBreathingSpace() {
      eventName = 'Enter Breathing Space';
      await this.triggerStepsWithScreenshot([
        () => caseViewPage.startEvent(eventName, caseId,
        ),
        () => enterBreathingSpacePage.selectBSType(),
        () => event.submit('Submit', ''),
        () => event.returnToCaseDetails(),
      ]);
    },

    async liftBreathingSpace() {
      eventName = 'Lift Breathing Space';
      await this.triggerStepsWithScreenshot([
        () => caseViewPage.startEvent(eventName, caseId),
        () => liftBreathingSpacePage.liftBS(),
        () => event.submit('Submit', ''),
        () => event.returnToCaseDetails(),
      ]);
    },

    async respondToClaimFullDefence({twoDefendants = false, defendant1Response = 'fullDefence', twoClaimants = false, claimType = 'fast', defenceType = 'dispute'}) {
      eventName = 'Respond to claim';
      await this.triggerStepsWithScreenshot([
        () => caseViewPage.startEvent(eventName, caseId),
        () => respondentCheckListPage.claimTimelineTemplate(),
        () => specConfirmDefendantsDetails.confirmDetails(twoDefendants),
        () => specConfirmLegalRepDetails.confirmDetails(),
        ... conditionalSteps(twoDefendants, [
          () => singleResponse.defendantsHaveSameResponse(true),
        ]),
        ... conditionalSteps(twoClaimants, [
          () => singleResponse.defendantsHaveSameResponseForBothClaimants(true),
        ]),
        () => responseTypeSpecPage.selectResponseType(defendant1Response),
        () => defenceTypePage.selectDefenceType(defenceType,150),
        () => disputeClaimDetailsPage.enterReasons(),
        () => claimResponseTimelineLRspecPage.addManually(),
        () => this.clickContinue(),
        ... conditionalSteps(claimType === 'fast', [
          () => fileDirectionsQuestionnairePage.fileDirectionsQuestionnaire(parties.RESPONDENT_SOLICITOR_1),
          () => disclosureOfElectronicDocumentsPage.enterDisclosureOfElectronicDocuments('specRespondent1'),
          () => this.clickContinue(),
          () => disclosureReportPage.enterDisclosureReport(parties.RESPONDENT_SOLICITOR_1),
          () => expertsPage.enterExpertInformation(parties.RESPONDENT_SOLICITOR_1),
          () => witnessesLRspecPage.enterWitnessInformation(parties.RESPONDENT_SOLICITOR_1),
          () => welshLanguageRequirementsPage.enterWelshLanguageRequirements(parties.RESPONDENT_SOLICITOR_1),
          () => hearingLRspecPage.enterHearing(parties.RESPONDENT_SOLICITOR_1),
        ]),
        ... conditionalSteps(claimType === 'small', [
          () => freeMediationPage.selectMediation('DefendantResponse'),
          () => useExpertPage.claimExpert('DefendantResponse'),
          () => enterWitnessesPage.howManyWitnesses('DefendantResponse'),
          () => welshLanguageRequirementsPage.enterWelshLanguageRequirements(parties.APPLICANT_SOLICITOR_1),
          () => smallClaimsHearingPage.selectHearing('DefendantResponse'),
        ]),
        () => chooseCourtSpecPage.chooseCourt('DefendantResponse'),
        () => hearingSupportRequirementsPage.selectRequirements(parties.RESPONDENT_SOLICITOR_1),
        () => vulnerabilityPage.selectVulnerability('no'),
        ... conditionalSteps(claimType === 'fast', [
          () => furtherInformationLRspecPage.enterFurtherInformation(parties.RESPONDENT_SOLICITOR_1),
        ]),
        () => statementOfTruth.enterNameAndRole(parties.RESPONDENT_SOLICITOR_1 + 'DQ'),
        () => event.submit('Submit', ''),
        () => event.returnToCaseDetails(),
      ]);

    },

    async respondToClaimPartAdmit({defendant1Response = 'partAdmission', claimType = 'fast', defenceType = 'repaymentPlan'}) {
      eventName = 'Respond to claim';
      await this.triggerStepsWithScreenshot([
        () => caseViewPage.startEvent(eventName, caseId),
        () => respondentCheckListPage.claimTimelineTemplate(),
        () => specConfirmDefendantsDetails.confirmDetails(),
        () => specConfirmLegalRepDetails.confirmDetails(),
        () => this.clickContinue(),
        () => responseTypeSpecPage.selectResponseType(defendant1Response),
        () => partAdmittedAmountPage.selectFullAdmitType('no'),
        () => disputeClaimDetailsPage.enterReasons(),
        () => claimResponseTimelineLRspecPage.addManually(),
        () => this.clickContinue(),
        () => admitPartPaymentRoutePage.selectPaymentRoute('repaymentPlan'),
        () => this.clickContinue(),
        () => this.clickContinue(),
        () => respondentHomeDetailsLRspecPage.selectRespondentHomeType(),
        () => respondentEmploymentTypePage.selectRespondentEmploymentType(),
        () => respondentCourtOrderTypePage.selectRespondentCourtOrderType(),
        () => respondentDebtsDetailsPage.selectDebtsDetails(),
        () => respondentCarerAllowanceDetailsPage.selectIncomeExpenses(),
        () => respondentPage.enterReasons(),
        ... conditionalSteps(defenceType === 'repaymentPlan', [
          () => respondentRepaymentPlanPage.selectRepaymentPlan(),
        ]),
        ... conditionalSteps(claimType === 'small', [
          () => freeMediationPage.selectMediation('DefendantResponse'),
          () => useExpertPage.claimExpert('DefendantResponse'),
          () => enterWitnessesPage.howManyWitnesses('DefendantResponse'),
          () => welshLanguageRequirementsPage.enterWelshLanguageRequirements(parties.APPLICANT_SOLICITOR_1),
          () => smallClaimsHearingPage.selectHearing('DefendantResponse'),
        ]),
        ... conditionalSteps(claimType === 'fast', [
          () => fileDirectionsQuestionnairePage.fileDirectionsQuestionnaire(parties.RESPONDENT_SOLICITOR_1),
          () => disclosureOfElectronicDocumentsPage.enterDisclosureOfElectronicDocuments('specRespondent1'),
          () => this.clickContinue(),
          () => disclosureReportPage.enterDisclosureReport(parties.RESPONDENT_SOLICITOR_1),
          () => expertsPage.enterExpertInformation(parties.RESPONDENT_SOLICITOR_1),
          () => witnessesLRspecPage.enterWitnessInformation(parties.RESPONDENT_SOLICITOR_1),
          () => welshLanguageRequirementsPage.enterWelshLanguageRequirements(parties.RESPONDENT_SOLICITOR_1),
          () => hearingLRspecPage.enterHearing(parties.RESPONDENT_SOLICITOR_1),

        ]),
        () => chooseCourtSpecPage.chooseCourt('DefendantResponse'),
        () => vulnerabilityPage.selectVulnerability('no'),
        () => this.clickContinue(),
        () => furtherInformationLRspecPage.enterFurtherInformation(parties.RESPONDENT_SOLICITOR_1),
        () => statementOfTruth.enterNameAndRole(parties.APPLICANT_SOLICITOR_1 + 'DQ'),
        () => event.submit('Submit', ''),
        () => event.returnToCaseDetails(),
      ]);

    },

    async respondToClaimFullAdmit({twoDefendants = false, defendant1Response = 'fullAdmission'}) {
      eventName = 'Respond to claim';
      await this.triggerStepsWithScreenshot([
        () => caseViewPage.startEvent(eventName, caseId),
        () => respondentCheckListPage.claimTimelineTemplate(),
        () => specConfirmDefendantsDetails.confirmDetails(),
        () => specConfirmLegalRepDetails.confirmDetails(),
        ... conditionalSteps(twoDefendants, [
          () => this.clickContinue(),
        ]),
        () => responseTypeSpecPage.selectResponseType(defendant1Response),
        () => fullAdmitTypeLRspecPage.selectFullAdmitType('no'),
        () => admitPartPaymentRoutePage.selectPaymentRoute('setDate'),
        () => this.clickContinue(),
        () => this.clickContinue(),
        () => respondentHomeDetailsLRspecPage.selectRespondentHomeType(),
        () => respondentEmploymentTypePage.selectRespondentEmploymentType(),
        () => respondentCourtOrderTypePage.selectRespondentCourtOrderType(),
        () => respondentDebtsDetailsPage.selectDebtsDetails(),
        () => respondentIncomeExpensesDetailsPage.selectIncomeExpenses(),
        () => respondentPage.enterReasons(),
        () => vulnerabilityPage.selectVulnerability('no'),
        () => statementOfTruth.enterNameAndRole(parties.APPLICANT_SOLICITOR_1 + 'DQ'),
        () => event.submit('Submit', ''),
        () => event.returnToCaseDetails(),
      ]);

    },

    async respondToDefence({mpScenario = 'ONE_V_ONE', claimType = 'fast'}) {
      eventName = 'View and respond to defence';
      await this.triggerStepsWithScreenshot([
        () => caseViewPage.startEvent(eventName, caseId),
        () => proceedPage.proceedWithClaim(mpScenario),
        () => this.clickContinue(),
        ... conditionalSteps(claimType === 'small', [
          () => freeMediationPage.selectMediation('ClaimantResponse'),
          () => useExpertPage.claimExpert('ClaimantResponse'),
          () => enterWitnessesPage.howManyWitnesses('ClaimantResponse'),
          () => welshLanguageRequirementsPage.enterWelshLanguageRequirements(parties.APPLICANT_SOLICITOR_1),
          () => smallClaimsHearingPage.selectHearing('ClaimantResponse'),
        ]),
        ... conditionalSteps(claimType === 'fast', [
          () => fileDirectionsQuestionnairePage.fileDirectionsQuestionnaire(parties.APPLICANT_SOLICITOR_1),
          () => disclosureOfElectronicDocumentsPage.enterDisclosureOfElectronicDocuments(parties.APPLICANT_SOLICITOR_1),
          () => this.clickContinue(),
          () => disclosureReportPage.enterDisclosureReport(parties.APPLICANT_SOLICITOR_1),
          () => expertsPage.enterExpertInformation(parties.APPLICANT_SOLICITOR_1),
          () => witnessesLRspecPage.enterWitnessInformation(parties.APPLICANT_SOLICITOR_1),
          () => welshLanguageRequirementsPage.enterWelshLanguageRequirements(parties.APPLICANT_SOLICITOR_1),
          () => hearingClaimantLRspecPage.enterHearing(parties.APPLICANT_SOLICITOR_1),
        ]),
        () => chooseCourtSpecPage.chooseCourt('ClaimantResponse'),
        () => hearingSupportRequirementsPage.selectRequirements(parties.APPLICANT_SOLICITOR_1),
        () => vulnerabilityQuestionsPage.vulnerabilityQuestions(parties.APPLICANT_SOLICITOR_1),
        () => furtherInformationLRspecPage.enterFurtherInformation(parties.APPLICANT_SOLICITOR_1),
        () => statementOfTruth.enterNameAndRole(parties.APPLICANT_SOLICITOR_1 + 'DQ'),
        () => event.submit('Submit your response', ''),
        () => event.returnToCaseDetails(),
      ]);
      await this.takeScreenshot();
    },

    async caseProceedsInCaseman() {
      eventName = 'Case proceeds in Caseman';

      await this.triggerStepsWithScreenshot([
        () => caseViewPage.startEvent(eventName, caseId),
        () => caseProceedsInCasemanPage.enterTransferDate(),
        () => takeCaseOffline.takeCaseOffline(),
      ]);
      await this.takeScreenshot();
    },

    async acknowledgeClaimSpec() {
      eventName = 'Acknowledgement of Service';
      await this.triggerStepsWithScreenshot([
        () => caseViewPage.startEvent(eventName, caseId),
        () => specConfirmDefendantsDetails.confirmDetails(),
        () => specConfirmLegalRepDetails.confirmDetails(),
        () => event.submit('Acknowledge claim', ''),
        () => event.returnToCaseDetails(),
      ]);
    },

    async navigateToCaseDetails(caseNumber) {
      await this.retryUntilExists(async () => {
        const normalizedCaseId = caseNumber.toString().replace(/\D/g, '');
        output.log(`Navigating to case: ${normalizedCaseId}`);
        await this.amOnPage(`${config.url.manageCase}/cases/case-details/${normalizedCaseId}`);
      }, SIGNED_IN_SELECTOR);

      await this.waitForSelector('.ccd-dropdown');
    },
  });
};
