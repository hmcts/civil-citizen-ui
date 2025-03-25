import request from 'supertest';
import {app} from '../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {
  CANCEL_URL,
  QM_FOLLOW_UP_URL,
  QM_INFORMATION_URL,
} from 'routes/urls';
import {getCancelUrl, getCaption} from 'services/features/qm/queryManagementService';
import {QualifyingQuestionTypeOption, WhatToDoTypeOption} from 'form/models/qm/queryManagement';
import {Claim} from 'models/claim';
import {CaseState} from 'form/models/claimDetails';
import * as utilityService from 'modules/utilityService';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/services/features/qm/queryManagementService');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');

jest.mock('modules/utilityService');

const CONTROLLER_URL = QM_INFORMATION_URL;
const FOLLOW_UP_URL = QM_FOLLOW_UP_URL;

function getControllerUrl(qmType: WhatToDoTypeOption, qmQualifyOption: QualifyingQuestionTypeOption ) {
  return CONTROLLER_URL.replace(':qmType', qmType).replace(':qmQualifyOption', qmQualifyOption);
}

const mockGetCaption = getCaption as jest.Mock;
const mockGetCancelUrl = getCancelUrl as jest.Mock;
const mockGetClaimById = utilityService.getClaimById as jest.Mock;

describe('Query management Information controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('on GET', () => {

    beforeEach(() => {
      jest.resetAllMocks();
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
      mockGetClaimById.mockImplementation(() => claim);

      await request(app)
        .get(getControllerUrl(WhatToDoTypeOption.SEND_DOCUMENTS, questionType))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(expectedText);
          expect(res.text).toContain('Anything else');
        });
    });
  });

  it.each([
    [QualifyingQuestionTypeOption.SUBMIT_RESPONSE_CLAIM, 'Submit a response to a claim', 'Get support to respond'],
    [QualifyingQuestionTypeOption.SEE_THE_CLAIM_ON_MY_ACCOUNT, 'See the claim on my account', 'Get support to see the claim on your account'],
    [QualifyingQuestionTypeOption.VIEW_DOCUMENTS_ON_MY_ACCOUNT, 'See the documents on my account', 'Get support to view the documents on your account'],
  ])('should return SOLVE_PROBLEM information for %s', async (questionType, title:string, subtitle: string ) => {
    mockGetCaption.mockImplementation(() => 'PAGES.QM.CAPTIONS.SEND_DOCUMENTS');

    const claim = new Claim();
    mockGetClaimById.mockImplementation(() => claim);

    await request(app)
      .get(getControllerUrl(WhatToDoTypeOption.SOLVE_PROBLEM, questionType))
      .expect((res) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(title);
        expect(res.text).toContain(subtitle);
        expect(res.text).toContain('If the issue is not urgent');
        expect(res.text).toContain('If the issue is urgent');
        expect(res.text).not.toContain('Anything else');
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
