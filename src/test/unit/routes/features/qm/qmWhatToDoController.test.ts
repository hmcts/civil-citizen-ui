import request from 'supertest';
import {app} from '../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {
  QM_INFORMATION_URL, QM_WHAT_DO_YOU_WANT_TO_DO_URL,
} from 'routes/urls';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {getCaption, getQueryManagement, saveQueryManagement} from 'services/features/qm/queryManagementService';
import {QualifyingQuestionTypeOption, QueryManagement, WhatToDoTypeOption} from 'form/models/qm/queryManagement';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/services/features/qm/queryManagementService');

const CONTROLLER_URL = QM_WHAT_DO_YOU_WANT_TO_DO_URL;

const getUrlByQmType = (option: WhatToDoTypeOption) :string => {
  return CONTROLLER_URL.replace(':qmType', option);
};

function getRedirections(qmType: WhatToDoTypeOption, qmQualifyOption: QualifyingQuestionTypeOption ) {
  return QM_INFORMATION_URL.replace(':qmType', qmType).replace(':qmQualifyOption', qmQualifyOption);
}

describe('Query management start Controller', () => {
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
    it('should return what to do page GET_UPDATE', async () => {
      mockGetCaption.mockImplementation(() => 'PAGES.QM.CAPTIONS.GET_UPDATE');
      await request(app)
        .get(getUrlByQmType(WhatToDoTypeOption.GET_UPDATE))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Get an update on my case');
        });
    });

    it('should return what to do page SEND_UPDATE', async () => {
      mockGetCaption.mockImplementation(() => 'PAGES.QM.CAPTIONS.SEND_UPDATE');
      await request(app)
        .get(getUrlByQmType(WhatToDoTypeOption.SEND_UPDATE))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Send an update on my case');
        });
    });

    it('should return what to do page SEND_DOCUMENTS', async () => {
      mockGetCaption.mockImplementation(() => 'PAGES.QM.CAPTIONS.SEND_DOCUMENTS');
      await request(app)
        .get(getUrlByQmType(WhatToDoTypeOption.SEND_DOCUMENTS))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Send documents');

        });
    });

    it('should return what to do page SOLVE_PROBLEM', async () => {
      mockGetCaption.mockImplementation(() => 'PAGES.QM.CAPTIONS.SOLVE_PROBLEM');
      await request(app)
        .get(getUrlByQmType(WhatToDoTypeOption.SOLVE_PROBLEM))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Solve a problem I am having using the Money claims system');
        });
    });

    it('should return what to do page MANAGE_HEARING', async () => {
      mockGetCaption.mockImplementation(() => 'PAGES.QM.CAPTIONS.MANAGE_HEARING');
      await request(app)
        .get(getUrlByQmType(WhatToDoTypeOption.MANAGE_HEARING))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Manage your hearing');
        });
    });

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
        [WhatToDoTypeOption.GET_UPDATE, TestMessages.QUERY_MANAGEMENT_YOU_MUST_SELECT],
        [WhatToDoTypeOption.SEND_UPDATE, TestMessages.QUERY_MANAGEMENT_YOU_MUST_SELECT],
        [WhatToDoTypeOption.SEND_DOCUMENTS, 'You must select which documents you want to send before you can continue.'],
        [WhatToDoTypeOption.SOLVE_PROBLEM, 'You must select what you are trying to do before you can continue.'],
        [WhatToDoTypeOption.MANAGE_HEARING, TestMessages.QUERY_MANAGEMENT_YOU_MUST_SELECT],
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
