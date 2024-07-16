import express from 'express';
const request = require('supertest');
const {app} = require('../../../../../../main/app');
import nock from 'nock';
import config from 'config';
import {CITIZEN_PARTNER_URL, CITIZEN_RESIDENCE_URL} from 'routes/urls';
import {FREE_TEXT_MAX_LENGTH} from 'form/validators/validationConstraints';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import fullAdmitPayBySetDateMock from '../../../../../utils/mocks/fullAdmitPayBySetDateMock.json';
import {Claim} from 'models/claim';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('modules/draft-store/draftStoreService');
const mockGetCaseData = getCaseDataFromStore as jest.Mock;

const agent = request.agent(app);
const tooLongHousingDetails: string = Array(FREE_TEXT_MAX_LENGTH + 2).join('a');
const respondentResidenceUrl = CITIZEN_RESIDENCE_URL.replace(':id', 'aaa');

describe('Citizen residence', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamServiceUrl: string = config.get('services.idam.url');

  beforeAll(() => {
    nock(idamServiceUrl)
      .post('/o/token')
      .reply(200, { id_token: citizenRoleToken });
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  });

  describe('on GET', () => {
    it('should return residence page', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), fullAdmitPayBySetDateMock.case_data);
      });
      await agent
        .get(respondentResidenceUrl)
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Where do you live?');
        });
    });

    it('should return status 500 when error thrown', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await agent
        .get(respondentResidenceUrl)
        .expect((res: Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
  describe('on POST', () => {
    beforeAll(() => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), fullAdmitPayBySetDateMock.case_data);
      });
    });

    it('should redirect when OWN_HOME option selected', async () => {
      await agent
        .post(respondentResidenceUrl)
        .send('type=OWN_HOME')
        .expect((res: express.Response) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(CITIZEN_PARTNER_URL.replace(':id', 'aaa'));
        });
    });

    it('should return error when no option selected', async () => {
      await agent
        .post(respondentResidenceUrl)
        .send('type=')
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_OPTION_SELECTION);
        });
    });

    it('should return error when type is \'Other\' and housing details not provided', async () => {
      await agent
        .post(respondentResidenceUrl)
        .send('type=OTHER')
        .send('housingDetails=')
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_HOUSING);
        });
    });

    it('should redirect when type is \'Other\' and housing details are provided', async () => {
      await agent
        .post(respondentResidenceUrl)
        .send('type=OTHER')
        .send('housingDetails=Palace')
        .expect((res: express.Response) => {
          expect(res.status).toBe(302);
          expect(res.get('location')).toBe(CITIZEN_PARTNER_URL.replace(':id', 'aaa'));
        });
    });

    it('should return error when type is \'Other\' and housing details are too long', async () => {
      await agent
        .post(respondentResidenceUrl)
        .send('type=OTHER')
        .send(`housingDetails=${tooLongHousingDetails}`)
        .expect((res: Response) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.VALID_TEXT_LENGTH);
        });
    });

    it('should status 500 when error thrown', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await agent
        .post(respondentResidenceUrl)
        .send('type=OTHER')
        .send('housingDetails=Palace')
        .expect((res: Response) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
