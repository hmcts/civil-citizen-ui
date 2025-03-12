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

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/services/features/qm/queryManagementService');

const CONTROLLER_URL = QM_INFORMATION_URL;
const FOLLOW_UP_URL = QM_FOLLOW_UP_URL;

function getControllerUrl(qmType: WhatToDoTypeOption, qmQualifyOption: QualifyingQuestionTypeOption ) {
  return CONTROLLER_URL.replace(':qmType', qmType).replace(':qmQualifyOption', qmQualifyOption);
}

const mockGetCaption = getCaption as jest.Mock;
const mockGetCancelUrl = getCancelUrl as jest.Mock;

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
    it('should return follow up page ', async () => {
      await request(app)
        .get(FOLLOW_UP_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Follow up on an existing message');
        });
    });

    it('should return information page ', async () => {
      mockGetCaption.mockImplementation(() => 'PAGES.QM.CAPTIONS.MANAGE_HEARING');
      await request(app)
        .get(getControllerUrl(WhatToDoTypeOption.MANAGE_HEARING, QualifyingQuestionTypeOption.CHANGE_THE_HEARING_DATE))
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Manage your hearing');
        });
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
