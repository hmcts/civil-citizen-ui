import request from 'supertest';
import {app} from '../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {
  CANCEL_URL,
  QM_FOLLOW_UP_URL,
  QM_INFORMATION_URL,
} from 'routes/urls';
import {getCancelUrl, getCaption} from 'services/features/queryManagement/queryManagementService';
import {QualifyingQuestionTypeOption, WhatToDoTypeOption} from 'form/models/queryManagement/queryManagement';
import {Claim} from 'models/claim';
import {CaseState} from 'form/models/claimDetails';
import {CaseRole} from 'form/models/caseRoles';
import {CivilServiceClient} from 'client/civilServiceClient';

jest.mock('../../../../../main/modules/oidc');
jest.mock('services/features/queryManagement/queryManagementService');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');

const CONTROLLER_URL = QM_INFORMATION_URL;
const FOLLOW_UP_URL = QM_FOLLOW_UP_URL;

function getControllerUrl(qmType: WhatToDoTypeOption, qmQualifyOption: QualifyingQuestionTypeOption ) {
  return CONTROLLER_URL.replace(':qmType', qmType).replace(':qmQualifyOption', qmQualifyOption);
}

const mockGetCaption = getCaption as jest.Mock;
const mockGetCancelUrl = getCancelUrl as jest.Mock;

const ANY_THING_ELSE_LABEL = 'If you need help with anything else';

describe('Query management Information controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on GET', () => {
    beforeEach(() => {
      jest.resetAllMocks();
      jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockResolvedValueOnce(new Claim());
    });

    it('should return follow up page ', async () => {
      await request(app)
        .get(FOLLOW_UP_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Follow up on an existing message');
        });
    });

    it.each([
      [QualifyingQuestionTypeOption.GA_OFFLINE, 'Make an application to the court'],
    ])('should return CHANGE_CASE information for %s', async (questionType, expectedText) => {
      mockGetCaption.mockImplementation(() => 'PAGES.QM.CAPTIONS.CHANGE_CASE');
      await request(app)
        .get(getControllerUrl(WhatToDoTypeOption.CHANGE_CASE, questionType))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(expectedText);
          expect(res.text).toContain(ANY_THING_ELSE_LABEL);
        });
    });

  });

  it.each([
    [QualifyingQuestionTypeOption.ENFORCEMENT_REQUESTS, false, 'Enforcement requests cannot be uploaded using the Money claims system.'],
    [QualifyingQuestionTypeOption.CLAIM_DOCUMENTS_AND_EVIDENCE, true, 'To upload evidence to your case'],
    [QualifyingQuestionTypeOption.CLAIM_DOCUMENTS_AND_EVIDENCE, false, 'You cannot upload claim evidence yet'],
    [QualifyingQuestionTypeOption.CHANGE_THE_HEARING_DATE, false, 'You will need to say why you need the hearing date changed and supply evidence of the need to change the date, for example, evidence of a hospital appointment or holiday booking.'],
    [QualifyingQuestionTypeOption.CHANGE_SOMETHING_ABOUT_THE_HEARING, false, 'You can apply to change the details of the hearing, such as:'],
    [QualifyingQuestionTypeOption.ASK_FOR_HELP_AND_SUPPORT_DURING_MY_HEARING, false, 'You can ask for help and support during your hearing.'],
  ])('should return SEND_DOCUMENTS information for %s', async (questionType, isCaseProgression, expectedText) => {
    mockGetCaption.mockImplementation(() => 'PAGES.QM.CAPTIONS.SEND_DOCUMENTS');

    const claim = new Claim();
    if (isCaseProgression) {
      claim.ccdState = CaseState.CASE_PROGRESSION;
    }

    jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockResolvedValueOnce(claim);

    await request(app)
      .get(getControllerUrl(WhatToDoTypeOption.SEND_DOCUMENTS, questionType))
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(expectedText);
        expect(res.text).toContain(ANY_THING_ELSE_LABEL);
      });
  });

  it.each([
    [QualifyingQuestionTypeOption.SUBMIT_RESPONSE_CLAIM, 'Submit a response to a claim', 'Get support to respond'],
    [QualifyingQuestionTypeOption.SEE_THE_CLAIM_ON_MY_ACCOUNT, 'See the claim on my account', 'Get support to see the claim on your account'],
    [QualifyingQuestionTypeOption.VIEW_DOCUMENTS_ON_MY_ACCOUNT, 'See the documents on my account', 'Get support to view the documents on your account'],
  ])('should return SOLVE_PROBLEM information for %s', async (questionType, title:string, subtitle: string ) => {
    mockGetCaption.mockImplementation(() => 'PAGES.QM.CAPTIONS.SEND_DOCUMENTS');
    jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockResolvedValueOnce(new Claim());
    await request(app)
      .get(getControllerUrl(WhatToDoTypeOption.SOLVE_PROBLEM, questionType))
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(title);
        expect(res.text).toContain(subtitle);
        expect(res.text).toContain('If the issue is not urgent');
        expect(res.text).toContain('If the issue is urgent');
        expect(res.text).not.toContain(ANY_THING_ELSE_LABEL);
      });
  });

  it.each([
    [QualifyingQuestionTypeOption.GENERAL_UPDATE, false, 'Get a general update on what is happening with the case', 'We cannot give updates on emails, forms or applications you have already sent to us.'],
    [QualifyingQuestionTypeOption.CLAIM_NOT_PAID, true, 'Understand what happens if the claim is not paid', '<a class="govuk-link" rel="noopener noreferrer" href=/case/:id/ccj/paid-amount>request a county court judgment (CCJ)</a>'],
    [QualifyingQuestionTypeOption.CLAIM_NOT_PAID, false, 'Understand what happens if the claim is not paid', '<p class="govuk-body ">If the defendant does not pay or respond by the deadline the court sets, the claimant will be given the option to request a county court judgment (CCJ).</p>'],
    [QualifyingQuestionTypeOption.CLAIM_NOT_PAID_AFTER_JUDGMENT, false, 'Understand what happens if the judgment is not paid', 'If the claimant applies for a judgment and the defendant has not met the deadlines in the judgment, the claimant can still try and get their money.'],
  ])('should return GET_UPDATE information for %s with isCcjLinkEnabled %s', async (questionType, isCcjLinkEnabled, title:string, textLink: string ) => {
    mockGetCaption.mockImplementation(() => 'PAGES.QM.CAPTIONS.GET_UPDATE');

    const claim = new Claim();
    claim.caseRole = CaseRole.DEFENDANT;
    if (isCcjLinkEnabled) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate()-1);

      claim.caseRole = CaseRole.CLAIMANT;
      claim.respondent1ResponseDeadline = yesterday;
      claim.ccdState = CaseState.AWAITING_RESPONDENT_ACKNOWLEDGEMENT;
    }

    jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockResolvedValueOnce(claim);

    await request(app)
      .get(getControllerUrl(WhatToDoTypeOption.GET_UPDATE, questionType))
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(title);
        expect(res.text).toContain(textLink);
        expect(res.text).toContain('Get an update on my case');
        expect(res.text).toContain(ANY_THING_ELSE_LABEL);
      });
  });

  it.each([
    [QualifyingQuestionTypeOption.CLAIM_NOT_PAID, 'Understand what happens if the claim is not paid'],
  ])('should return GET_UPDATE information for %s', async (questionType, title:string ) => {
    mockGetCaption.mockImplementation(() => 'PAGES.QM.CAPTIONS.GET_UPDATE');

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate()-1);

    const claim = new Claim();
    claim.caseRole = CaseRole.DEFENDANT;
    claim.ccdState = CaseState.AWAITING_RESPONDENT_ACKNOWLEDGEMENT;

    claim.respondent1ResponseDeadline = yesterday;

    jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockResolvedValueOnce(claim);

    await request(app)
      .get(getControllerUrl(WhatToDoTypeOption.GET_UPDATE, questionType))
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(title);
        expect(res.text).toContain('The defendant has up to 28 days to respond once they receive the claim.');
        expect(res.text).toContain('Get an update on my case');
        expect(res.text).toContain(ANY_THING_ELSE_LABEL);
      });
  });

  it.each([
    [QualifyingQuestionTypeOption.PAID_OR_PARTIALLY_PAID_JUDGMENT, null, 'Update the court about a partially paid judgment or claim', 'If part of the judgment or claim amount has been paid'],
    [QualifyingQuestionTypeOption.SETTLE_CLAIM, false, 'Settle a claim', 'If the claim is paid or you agree the balance is settled'],
    [QualifyingQuestionTypeOption.SETTLE_CLAIM, true, 'Settle a claim', 'If the claim is paid or you agree the balance is settled'],
    [QualifyingQuestionTypeOption.AMEND_CLAIM_DETAILS, null, 'Amend the claim details', 'If you want to change the details of your claim, including:'],
    [QualifyingQuestionTypeOption.CLAIM_ENDED, null, 'Tell the court you do not want to continue your claim', 'To tell the court you no longer want to continue with your claim, you need to fill in and send a form called a'],
  ])('should return SEND_UPDATE information for %s and isClaimant %s', async (questionType, isClaimant: boolean, title:string, subtitle: string ) => {
    mockGetCaption.mockImplementation(() => 'PAGES.QM.CAPTIONS.SEND_UPDATE');
    const isSettleClaimAndIsClaimant = QualifyingQuestionTypeOption.SETTLE_CLAIM && isClaimant;
    const claim = new Claim();
    if (isSettleClaimAndIsClaimant) {
      claim.caseRole = CaseRole.CLAIMANT;
      claim.ccdState = CaseState.CASE_PROGRESSION;
    }

    jest.spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails').mockResolvedValueOnce(claim);

    await request(app)
      .get(getControllerUrl(WhatToDoTypeOption.SOLVE_PROBLEM, questionType))
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(title);
        expect(res.text).toContain(subtitle);
        expect(res.text).toContain('Send an update on my case');
        if (isSettleClaimAndIsClaimant){
          expect(res.text).toContain('<a class="govuk-link" rel="noopener noreferrer" href=/case/:id/paid-in-full/date-paid>tell us you’ve settled the claim</a>');

        } else if (questionType === QualifyingQuestionTypeOption.SETTLE_CLAIM) {
          expect(res.text).toContain('If you are a claimant, update the claim in the online service by selecting tell us you’ve settled the claim.');
        }
        expect(res.text).toContain(ANY_THING_ELSE_LABEL);
      });
  });

  describe('on POST', () => {
    it('should return follow up page ', async () => {
      mockGetCancelUrl.mockImplementation(() => CANCEL_URL);

      await request(app)
        .post(FOLLOW_UP_URL)
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual('/case/:id/:propertyName/cancel');
        });
    });

  });

});
