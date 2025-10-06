import request from 'supertest';
import {app} from '../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {
  QM_INFORMATION_URL, QM_SHARE_QUERY_CONFIRMATION, QM_WHAT_DO_YOU_WANT_TO_DO_URL,
} from 'routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {getCaption, getQueryManagement, saveQueryManagement} from 'services/features/queryManagement/queryManagementService';
import {QualifyingQuestionTypeOption, QueryManagement, WhatToDoTypeOption} from 'form/models/queryManagement/queryManagement';

jest.mock('../../../../../main/modules/oidc');
jest.mock('services/features/queryManagement/queryManagementService');

const CONTROLLER_URL = QM_WHAT_DO_YOU_WANT_TO_DO_URL;

const getUrlByQmType = (option: WhatToDoTypeOption) :string => {
  return CONTROLLER_URL.replace(':qmType', option);
};

function getRedirections(qmType: WhatToDoTypeOption, qmQualifyOption: QualifyingQuestionTypeOption ) {
  return QM_INFORMATION_URL.replace(':qmType', qmType).replace(':qmQualifyOption', qmQualifyOption);
}

describe('Query management what do do controller', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  const mockGetCaseData = getQueryManagement as jest.Mock;
  const mockGetCaption = getCaption as jest.Mock;

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  });

  beforeEach(() => {
    jest.resetAllMocks();
    mockGetCaseData.mockImplementation(async () => {
      const claim = new Claim();
      claim.queryManagement = new QueryManagement();
      return claim;
    });
  });

  describe('on GET', () => {

    it.each([
      [WhatToDoTypeOption.GET_UPDATE, 'Get an update on my case', 'What do you want to do?'],
      [WhatToDoTypeOption.SEND_UPDATE, 'Send an update on my case', 'What do you want to do?'],
      [WhatToDoTypeOption.SEND_DOCUMENTS, 'Send documents', 'What documents do you want to send?'],
      [WhatToDoTypeOption.SOLVE_PROBLEM, 'Solve a problem I am having using the Money claims system', 'What are you trying to do?'],
      [WhatToDoTypeOption.MANAGE_HEARING, 'Manage your hearing', 'What do you want to do?'],
    ])('should open what to do page %s with caption %s and title %s', async (qmType, caption, title) => {
      mockGetCaption.mockImplementation(() => `PAGES.QM.CAPTIONS.${qmType}`);
      await request(app)
        .get(getUrlByQmType(qmType))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(caption);
          expect(res.text).toContain(title);
        });
    });

    it.each([
      [WhatToDoTypeOption.MANAGE_HEARING, QualifyingQuestionTypeOption.MANAGE_HEARING_SOMETHING_ELSE],
    ])(
      'should redirect page when %s with %s selected',
      async (qmType, option) => {
        await request(app)
          .post(getUrlByQmType(qmType))
          .send({option})
          .expect((res) => {
            expect(res.status).toBe(302);
            expect(res.header.location).toEqual(QM_SHARE_QUERY_CONFIRMATION);
          });
      },
    );

    it('should return http 500 when has error', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(CONTROLLER_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    describe('Validation Tests', () => {
      it.each([
        [WhatToDoTypeOption.GET_UPDATE, 'You must select what update you want to get from the court.'],
        [WhatToDoTypeOption.SEND_UPDATE, 'You must select what update you want to get from the court.'],
        [WhatToDoTypeOption.SEND_DOCUMENTS, 'You must select which documents you want to send.'],
        [WhatToDoTypeOption.SOLVE_PROBLEM, 'You must select what problem you are having with the Money claims system.'],
        [WhatToDoTypeOption.MANAGE_HEARING, 'You must select how you want to manage your hearing.'],
      ])(
        'should validate the page %s',
        async (qmType, expectedMessage) => {
          await request(app)
            .post(getUrlByQmType(qmType))
            .expect((res) => {
              expect(res.status).toBe(200);
              expect(res.text).toContain(expectedMessage);
            });
        },
      );
    });

    describe('Redirection Tests', () => {
      it.each([
        [WhatToDoTypeOption.GET_UPDATE, QualifyingQuestionTypeOption.GENERAL_UPDATE],
        [WhatToDoTypeOption.SEND_UPDATE, QualifyingQuestionTypeOption.SETTLE_CLAIM],
        [WhatToDoTypeOption.SEND_DOCUMENTS, QualifyingQuestionTypeOption.ENFORCEMENT_REQUESTS],
        [WhatToDoTypeOption.SOLVE_PROBLEM, QualifyingQuestionTypeOption.SUBMIT_RESPONSE_CLAIM],
        [WhatToDoTypeOption.MANAGE_HEARING, QualifyingQuestionTypeOption.CHANGE_THE_HEARING_DATE],
      ])(
        'should redirect page when %s with %s selected',
        async (qmType, option) => {
          await request(app)
            .post(getUrlByQmType(qmType))
            .send({ option })
            .expect((res) => {
              expect(res.status).toBe(302);
              expect(res.header.location).toEqual(getRedirections(qmType, option));
            });
        },
      );
    });

    it('should return http 500 when has error', async () => {
      const mockSaveDraftClaim = saveQueryManagement as jest.Mock;
      mockSaveDraftClaim.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .post(CONTROLLER_URL)
        .send({option: WhatToDoTypeOption.CHANGE_CASE})
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
