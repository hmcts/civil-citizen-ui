import request from 'supertest';
import {app} from '../../../../../../main/app';
import nock from 'nock';
import config from 'config';
import {CITIZEN_PHONE_NUMBER_URL} from 'routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {t} from 'i18next';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {Claim} from 'models/claim';
import {configureSpy} from '../../../../../utils/spyConfiguration';
import * as carmToggleUtils from 'common/utils/carmToggleUtils';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {Party} from 'models/party';
import {PartyType} from 'models/partyType';
import {PartyPhone} from 'models/PartyPhone';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
jest.mock('.../../../../../../main/modules/draft-store/draftStoreService');

const mockGetCaseData = getCaseDataFromStore as jest.Mock;

const isCarmEnabledSpy = (calmEnabled: boolean) => configureSpy(carmToggleUtils, 'isCarmEnabledForCase')
  .mockReturnValue(Promise.resolve(calmEnabled));

function getClaim() {
  const claim = new Claim();
  claim.applicant1 = new Party();
  claim.applicant1.type = PartyType.COMPANY;
  claim.applicant1.partyDetails = {
    partyName: 'test',
  };
  claim.submittedDate = new Date(Date.now());
  return claim;
}

describe('Citizen phone number', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
    jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('12345');
  });

  // delete after CARM release
  describe('on GET, CARM off', () => {
    beforeEach(() => {
      isCarmEnabledSpy(false);
    });

    it('should return citizen phone number page with all information from redis', async () => {
      mockGetCaseData.mockImplementation(async () => {
        const claim = getClaim();
        claim.applicant1.partyPhone =  new PartyPhone('01234567890');
        return claim;
      });
      await request(app)
        .get(CITIZEN_PHONE_NUMBER_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_PHONE_NUMBER_OPTIONAL);
        });
    });
    it('should return empty citizen phone number page', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return getClaim();
      });
      await request(app)
        .get(CITIZEN_PHONE_NUMBER_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_PHONE_NUMBER_OPTIONAL);
        });
    });
    it('should return http 500 when has error in the get method', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
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

    it('should return citizen phone number page with all information from redis', async () => {
      mockGetCaseData.mockImplementation(async () => {
        const claim = getClaim();
        claim.applicant1.partyPhone =  new PartyPhone('01234567890');
        return claim;
      });
      await request(app)
        .get(CITIZEN_PHONE_NUMBER_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_PHONE_NUMBER);
        });
    });
    it('should return empty citizen phone number page', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return getClaim();
      });
      await request(app)
        .get(CITIZEN_PHONE_NUMBER_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_PHONE_NUMBER);
          expect(res.text).not.toContain(TestMessages.ENTER_PHONE_NUMBER_OPTIONAL);
        });
    });
    it('should return http 500 when has error in the get method', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
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
      mockGetCaseData.mockImplementation(async () => {
        return getClaim();
      });
    });

    it('should return error on incorrect input', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return getClaim();
      });
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
    it('should redirect on correct input when has information on redis', async () => {
      await request(app)
        .post(CITIZEN_PHONE_NUMBER_URL)
        .send('telephoneNumber=01234567890')
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });
    it('should redirect on correct input', async () => {
      await request(app)
        .post(CITIZEN_PHONE_NUMBER_URL)
        .send('telephoneNumber=01234567890')
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });
    it('should redirect on empty input', async () => {
      await request(app)
        .post(CITIZEN_PHONE_NUMBER_URL)
        .send('telephoneNumber=')
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });
    it('should return http 500 when has error in the post method', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
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
      mockGetCaseData.mockImplementation(async () => {
        return getClaim();
      });
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
    it('should redirect on correct input when has information on redis', async () => {
      await request(app)
        .post(CITIZEN_PHONE_NUMBER_URL)
        .send('telephoneNumber=01234567890')
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });
    it('should redirect on correct input', async () => {
      await request(app)
        .post(CITIZEN_PHONE_NUMBER_URL)
        .send('telephoneNumber=01234567890')
        .expect((res) => {
          expect(res.status).toBe(302);
        });
    });
    it('should return error on empty input', async () => {
      await request(app)
        .post(CITIZEN_PHONE_NUMBER_URL)
        .send('telephoneNumber=')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.ENTER_TELEPHONE_NUMBER'));
        });
    });
    it('should return http 500 when has error in the post method', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .post(CITIZEN_PHONE_NUMBER_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
