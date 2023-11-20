import request from 'supertest';
import {app} from '../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {
  mockCivilClaim, mockDefendantResponseSmallClaimFullReject,
  mockRedisFailure,
} from '../../../../utils/mockDraftStore';
import {setResponseDeadline} from 'services/features/common/responseDeadlineAgreedService';
import {TaskList} from 'models/taskList/taskList';
import {configureSpy} from '../../../../utils/spyConfiguration';
import civilClaimResponseMock from '../../../../utils/mocks/civilClaimResponseMock.json';
import {Claim} from 'models/claim';
import {deepCopy} from '../../../../utils/deepCopy';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import * as carmToggleUtils from 'common/utils/carmToggleUtils';
import * as taskListService from 'services/features/common/taskListService';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/services/features/common/responseDeadlineAgreedService');

const mockSetResponseDeadline = setResponseDeadline as jest.Mock;

const isCarmEnabledSpy = (calmEnabled: boolean) => configureSpy(carmToggleUtils, 'isCarmEnabledForCase')
  .mockReturnValue(Promise.resolve(calmEnabled));

const getTaskListSpy = (taskList: TaskList[]) => configureSpy(taskListService, 'getTaskLists')
  .mockReturnValue(taskList);

const responseTaskListUrl = (lang = 'en') => {
  return RESPONSE_TASK_LIST_URL
    .replace(':id', '1645882162449409')
    .concat(`?lang=${lang}`);
};

describe('Claimant details', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  const claim = require('../../../../utils/mocks/civilClaimResponseMock.json');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    mockSetResponseDeadline.mockImplementation(async () => {
      return new Date();
    });
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  });

  beforeEach(() => {
    isCarmEnabledSpy(true);
  });

  describe('on GET', () => {
    it('should return contact claimant details from claim', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .get(responseTaskListUrl())
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Respond to a money claim');
          expect(res.text).toContain('Prepare your response');
          expect(res.text).toContain('Respond to claim');
          expect(res.text).toContain('Submit');
          expect(res.text).toContain('Response deadline:');
          expect(res.text).toContain('15 May 2025'); // Response deadline value
          expect(res.text).toContain('Claim number:');
          expect(res.text).toContain(claim.case_data.legacyCaseReference);
          expect(res.text).toContain('Total claim amount:');
          expect(res.text).toContain(claim.case_data.totalClaimAmount.toString());
          expect(res.text).toContain('Claim details:');
        });
    });

    it('should return Telephone Mediation and Availability for mediation tasks when isCarmEnabledForCase returns true', async () => {
      app.locals.draftStoreClient = mockDefendantResponseSmallClaimFullReject;
      await request(app)
        .get(responseTaskListUrl())
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Telephone mediation');
          expect(res.text).toContain('Availability for mediation');
          expect(res.text).not.toContain('Free telephone mediation');
        });
    });

    it('should not return Free telephone mediation task when isCarmEnabledForCase returns false', async () => {
      app.locals.draftStoreClient = mockDefendantResponseSmallClaimFullReject;
      isCarmEnabledSpy(false);

      await request(app)
        .get(responseTaskListUrl())
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('Free telephone mediation');
          expect(res.text).not.toContain('Telephone mediation');
          expect(res.text).not.toContain('Availability for mediation');
        });
    });

    it('should call isCarmEnabledForCase with claim submitted date', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      const dateSubmitted = civilClaimResponseMock.case_data.submittedDate;
      const isCarmEnabled = isCarmEnabledSpy(true);

      await request(app).get(responseTaskListUrl());

      expect(isCarmEnabled).toBeCalledTimes(1);
      expect(isCarmEnabled).toBeCalledWith(dateSubmitted);
    });

    describe('should call getTaskLists with expected arguments', () => {
      let taskListSpy: jest.SpyInstance;
      let caseData: Claim;

      beforeEach(() => {
        app.locals.draftStoreClient = mockCivilClaim;
        taskListSpy = getTaskListSpy([]);
        caseData = {
          ...deepCopy(civilClaimResponseMock.case_data),
          id: civilClaimResponseMock.id,
        } as unknown as Claim;
      });

      it('when isCarmEnabledForCase returns true', async () => {
        isCarmEnabledSpy(true);

        await request(app).get(responseTaskListUrl());

        expect(taskListSpy).toBeCalledTimes(1);
        expect(taskListSpy).toBeCalledWith(caseData, caseData.id, 'en', true);
      });

      it('when isCarmEnabledForCase returns false', async () => {
        isCarmEnabledSpy(false);

        await request(app).get(responseTaskListUrl());

        expect(taskListSpy).toBeCalledTimes(1);
        expect(taskListSpy).toBeCalledWith(caseData, caseData.id, 'en', false);
      });
    });

    it('should return http 500 when has error in the get method', async () => {
      app.locals.draftStoreClient = mockRedisFailure;
      await request(app)
        .get(RESPONSE_TASK_LIST_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
        });
    });
  });
});
