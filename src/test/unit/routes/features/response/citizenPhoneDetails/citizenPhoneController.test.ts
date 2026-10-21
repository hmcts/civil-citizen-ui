import request from 'supertest';
import {app} from '../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {CITIZEN_PHONE_NUMBER_URL} from 'routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {t} from 'i18next';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {PartyPhone} from 'models/PartyPhone';
import {configureSpy} from '../../../../../utils/spyConfiguration';
import * as launchDarklyClient from '../../../../../../main/app/auth/launchdarkly/launchDarklyClient';
import {getResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';
import {saveTelephoneToResponseDraft} from 'services/features/claim/yourDetails/phoneService';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/app/auth/launchdarkly/launchDarklyClient');
jest.mock('../../../../../../main/modules/draft-store/response/responseDraftStoreService');
jest.mock('../../../../../../main/services/features/claim/yourDetails/phoneService', () => ({
  saveTelephoneToResponseDraft: jest.fn().mockResolvedValue(undefined),
}));

const mockGetResponseDraft = getResponseDraft as jest.Mock;
const mockSaveTelephone = saveTelephoneToResponseDraft as jest.Mock;

const isCarmEnabledSpy = (calmEnabled: boolean) => configureSpy(launchDarklyClient, 'isCarmEnabledForCase')
  .mockReturnValue(Promise.resolve(calmEnabled));

const mockResponseClaim = (claim: Claim = new Claim()) => {
  claim.submittedDate = claim.submittedDate ?? new Date(2024, 5, 23);
  mockGetResponseDraft.mockResolvedValue({
    claimResponse: {id: 'draft-123', case_data: claim},
    rawResponse: {draftId: 'draft-123', payload: claim},
    createdAt: '',
    updatedAt: '',
    expiresAt: '',
  });
};

describe('Citizen phone number', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockSaveTelephone.mockResolvedValue(undefined);
    mockResponseClaim(new Claim());
  });

  // delete after CARM release
  describe('on GET, CARM off', () => {
    beforeEach(() => {
      isCarmEnabledSpy(false);
    });

    it('should return citizen phone number page with all information from response draft', async () => {
      const claim = new Claim();
      claim.respondent1 = new Party();
      claim.respondent1.partyPhone = new PartyPhone('01632960001');
      mockResponseClaim(claim);
      await request(app)
        .get(CITIZEN_PHONE_NUMBER_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_PHONE_NUMBER_OPTIONAL);
        });
    });
    it('should return empty citizen phone number page', async () => {
      mockResponseClaim(new Claim());
      await request(app)
        .get(CITIZEN_PHONE_NUMBER_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_PHONE_NUMBER_OPTIONAL);
        });
    });
    it('should return http 500 when has error in the get method', async () => {
      mockGetResponseDraft.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));
      await request(app)
        .get(CITIZEN_PHONE_NUMBER_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on GET, CARM on', () => {
    beforeEach(() => {
      isCarmEnabledSpy(true);
    });

    it('should return citizen phone number page with all information from response draft', async () => {
      const claim = new Claim();
      claim.respondent1 = new Party();
      claim.respondent1.partyPhone = new PartyPhone('01632960001');
      mockResponseClaim(claim);
      await request(app)
        .get(CITIZEN_PHONE_NUMBER_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_PHONE_NUMBER);
        });
    });
    it('should return empty citizen phone number page', async () => {
      mockResponseClaim(new Claim());
      await request(app)
        .get(CITIZEN_PHONE_NUMBER_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_PHONE_NUMBER);
          expect(res.text).not.toContain(TestMessages.ENTER_PHONE_NUMBER_OPTIONAL);
        });
    });
    it('should return http 500 when has error in the get method', async () => {
      mockGetResponseDraft.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));
      await request(app)
        .get(CITIZEN_PHONE_NUMBER_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  // delete after CARM release
  describe('on POST. CARM off', () => {
    beforeEach(() => {
      isCarmEnabledSpy(false);
      mockResponseClaim(new Claim());
    });

    it('should return error on incorrect input', async () => {
      await request(app)
        .post(CITIZEN_PHONE_NUMBER_URL)
        .send('telephoneNumber=abc')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_PHONE_NUMBER'));
        });
    });
    it('should return error on input with interior spaces', async () => {
      await request(app)
        .post(CITIZEN_PHONE_NUMBER_URL)
        .send('telephoneNumber=123 456')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_PHONE_NUMBER'));
        });
    });
    it('should accept input with trailing whitespaces', async () => {
      await request(app)
        .post(CITIZEN_PHONE_NUMBER_URL)
        .send('telephoneNumber= 01234567890 ')
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });
    it('should redirect on correct input when has information on response draft', async () => {
      await request(app)
        .post(CITIZEN_PHONE_NUMBER_URL)
        .send('telephoneNumber=01234567890')
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });
    it('should redirect on correct input', async () => {
      mockResponseClaim(new Claim());
      await request(app)
        .post(CITIZEN_PHONE_NUMBER_URL)
        .send('telephoneNumber=01234567890')
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });
    it('should redirect on empty input', async () => {
      mockResponseClaim(new Claim());
      await request(app)
        .post(CITIZEN_PHONE_NUMBER_URL)
        .send('telephoneNumber=')
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });
    it('should return http 500 when has error in the post method', async () => {
      mockGetResponseDraft.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));
      await request(app)
        .post(CITIZEN_PHONE_NUMBER_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST. CARM on', () => {
    beforeEach(() => {
      isCarmEnabledSpy(true);
      mockResponseClaim(new Claim());
    });

    it('should return error on incorrect input', async () => {
      await request(app)
        .post(CITIZEN_PHONE_NUMBER_URL)
        .send('telephoneNumber=abc')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_PHONE_NUMBER'));
        });
    });
    it('should return error on input with interior spaces', async () => {
      await request(app)
        .post(CITIZEN_PHONE_NUMBER_URL)
        .send('telephoneNumber=123 456')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_PHONE_NUMBER'));
        });
    });
    it('should accept input with trailing whitespaces', async () => {
      await request(app)
        .post(CITIZEN_PHONE_NUMBER_URL)
        .send('telephoneNumber= 01234567890 ')
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });
    it('should redirect on correct input when has information on response draft', async () => {
      await request(app)
        .post(CITIZEN_PHONE_NUMBER_URL)
        .send('telephoneNumber=01234567890')
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });
    it('should redirect on correct input', async () => {
      mockResponseClaim(new Claim());
      await request(app)
        .post(CITIZEN_PHONE_NUMBER_URL)
        .send('telephoneNumber=01234567890')
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });
    it('should return error on empty input', async () => {
      mockResponseClaim(new Claim());
      await request(app)
        .post(CITIZEN_PHONE_NUMBER_URL)
        .send('telephoneNumber=')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.ENTER_TELEPHONE_NUMBER'));
        });
    });
    it('should return http 500 when has error in the post method', async () => {
      mockGetResponseDraft.mockRejectedValue(new Error(TestMessages.REDIS_FAILURE));
      await request(app)
        .post(CITIZEN_PHONE_NUMBER_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
