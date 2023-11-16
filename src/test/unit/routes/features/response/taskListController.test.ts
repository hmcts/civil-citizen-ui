import request from 'supertest';
import {app} from '../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {RESPONSE_TASK_LIST_URL} from 'routes/urls';
import {mockCivilClaim, mockRedisFailure} from '../../../../utils/mockDraftStore';
import {setResponseDeadline} from 'services/features/common/responseDeadlineAgreedService';
import {TaskList} from 'models/taskList/taskList';
import {Claim} from 'models/claim';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import * as caarmTogglesUtils from 'common/utils/carmToggleUtils';
import * as taskListService from 'services/features/common/taskListService';
import * as utilityService from 'modules/utilityService';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/services/features/common/responseDeadlineAgreedService');

const mockSetResponseDeadline = setResponseDeadline as jest.Mock;

const carmToggleSpy = (calmEnabled: boolean) => jest.spyOn(caarmTogglesUtils, 'isCarmEnabledForCase')
  .mockReturnValue(Promise.resolve(calmEnabled));

const getTaskListSpy = (taskList: TaskList[]) => jest.spyOn(taskListService, 'getTaskLists')
  .mockReturnValue(taskList);

const getCaseByIdSpy = (claim: Claim) => jest.spyOn(utilityService, 'getClaimById')
  .mockReturnValue(Promise.resolve(claim));

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

  describe('on GET', () => {
    it('should return contact claimant details from claim', async () => {
      app.locals.draftStoreClient = mockCivilClaim;
      await request(app)
        .get(RESPONSE_TASK_LIST_URL)
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

    it('should call isCarmEnabledForCase with claim submitted date', async () => {
      const mockClaim = { submittedDate: new Date(2022, 5, 23) } as Claim;
      getCaseByIdSpy(mockClaim);
      const calmEnabledSpy = carmToggleSpy(true);

      await request(app).get(RESPONSE_TASK_LIST_URL);

      expect(calmEnabledSpy).toBeCalledTimes(1);
      expect(calmEnabledSpy).toBeCalledWith(mockClaim.submittedDate);
    });

    it('should call getTaskLists with carm toggle value', async () => {
      const isCarmEnabled = true;
      const mockClaim = { applicant1: {}} as Claim;
      getCaseByIdSpy(mockClaim);
      carmToggleSpy(isCarmEnabled);
      const taskListSpy = getTaskListSpy([]);

      await request(app).get(RESPONSE_TASK_LIST_URL);

      expect(taskListSpy).toBeCalledTimes(1);
      expect(taskListSpy).toBeCalledWith(mockClaim, ':id', undefined, isCarmEnabled);
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
