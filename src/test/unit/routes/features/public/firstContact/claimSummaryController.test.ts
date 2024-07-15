
import request from 'supertest';
import {app} from '../../../../../../main/app';
import {YesNo} from 'form/models/yesNo';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {FIRST_CONTACT_ACCESS_DENIED_URL, FIRST_CONTACT_CLAIM_SUMMARY_URL} from 'routes/urls';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import { Session } from 'express-session';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import civilClaimResponseWithTimelineAndEvidenceMock
  from '../../../../../utils/mocks/civilClaimResponseTimelineAndEvidenceMock.json';
import {Claim} from 'models/claim';

//jest.mock('modules/draft-store');
jest.mock('modules/draft-store/draftStoreService');

const mockGetCaseData = getCaseDataFromStore as jest.Mock;

describe('First contact - claim summary controller', () => {
  beforeAll(() => {
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  });
  beforeEach(() => {
    mockGetCaseData.mockImplementation(async () => {
      const jsonObject = JSON.parse(JSON.stringify(civilClaimResponseWithTimelineAndEvidenceMock));
      return Object.assign(new Claim(), jsonObject.case_data as Claim);

    });
  });
  it('should render page successfully if cookie has correct values', async () => {
    app.request['session'] = { 'firstContact': { claimId: '1645882162449404', pin: 'U2FsdGVkX1/zOWTQROZZZeiZIfqxcAIoSBnhZM6So0s=' } } as unknown as Session;
    mockGetCaseData.mockImplementation(async () => {
      const jsonObject = JSON.parse(JSON.stringify(civilClaimResponseWithTimelineAndEvidenceMock));
      return Object.assign(new Claim(), jsonObject.case_data as Claim);
    });
    await request(app).get(FIRST_CONTACT_CLAIM_SUMMARY_URL).expect((res) => {
      expect(res.status).toBe(200);
      expect(res.text).toContain('Claim details');
    });
  });

  it('should return 500 error page for redis failure', async () => {
    app.request['session'] = { 'firstContact': { claimId: '1645882162449404', pin: 'U2FsdGVkX1/zOWTQROZZZeiZIfqxcAIoSBnhZM6So0s=' } } as unknown as Session;
    mockGetCaseData.mockImplementation(async () => {
      throw new Error(TestMessages.REDIS_FAILURE);
    });

    await request(app)
      .get(FIRST_CONTACT_CLAIM_SUMMARY_URL)
      .expect((res) => {
        expect(res.status).toBe(500);
        expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
      });
  });

  it('should redirect to access denied page if cookie is missing pinVerified property', async () => {
    app.request['session'] = { 'firstContact': { claimId: '1645882162449404' } } as unknown as Session;

    await request(app).get(FIRST_CONTACT_CLAIM_SUMMARY_URL).expect((res) => {
      expect(res.status).toBe(302);
      expect(res.header.location).toBe(FIRST_CONTACT_ACCESS_DENIED_URL);
    });
  });

  it('should redirect to access denied page if cookie is missing claimId property', async () => {
    app.request['session'] = { 'firstContact': { pin: 'U2FsdGVkX1/zOWTQROZZZeiZIfqxcAIoSBnhZM6So0s=' } } as unknown as Session;

    await request(app).get(FIRST_CONTACT_CLAIM_SUMMARY_URL).expect((res) => {
      expect(res.status).toBe(302);
      expect(res.header.location).toBe(FIRST_CONTACT_ACCESS_DENIED_URL);
    });
  });

  it('should redirect to access denied page if cookie is missing claimId property and pinVerified is no', async () => {
    app.request['session'] = { 'firstContact': { pin: YesNo.NO } } as unknown as Session;

    await request(app).get(FIRST_CONTACT_CLAIM_SUMMARY_URL).expect((res) => {
      expect(res.status).toBe(302);
      expect(res.header.location).toBe(FIRST_CONTACT_ACCESS_DENIED_URL);
    });
  });

  it('should redirect to access denied page if cookie pinVerified value is no', async () => {
    app.request['session'] = { 'firstContact': { claimId: '1645882162449404', pin: YesNo.NO } } as unknown as Session;

    await request(app).get(FIRST_CONTACT_CLAIM_SUMMARY_URL).expect((res) => {
      expect(res.status).toBe(302);
      expect(res.header.location).toBe(FIRST_CONTACT_ACCESS_DENIED_URL);
    });
  });

  it('should redirect to access denied page if firstContact cookie is not empty', async () => {
    app.request['session'] = { 'firstContact': {} } as unknown as Session;

    await request(app).get(FIRST_CONTACT_CLAIM_SUMMARY_URL).expect((res) => {
      expect(res.status).toBe(302);
      expect(res.header.location).toBe(FIRST_CONTACT_ACCESS_DENIED_URL);
    });
  });

  it('should redirect to access denied page if cookie is missing', async () => {
    app.request['session'] = {} as unknown as Session;

    await request(app).get(FIRST_CONTACT_CLAIM_SUMMARY_URL).expect((res) => {
      expect(res.status).toBe(302);
      expect(res.header.location).toBe(FIRST_CONTACT_ACCESS_DENIED_URL);
    });
  });
});
