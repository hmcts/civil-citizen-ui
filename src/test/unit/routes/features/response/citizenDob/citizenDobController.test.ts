import {app} from '../../../../../../main/app';
import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {
  AGE_ELIGIBILITY_URL,
  DOB_URL,
  CITIZEN_PHONE_NUMBER_URL,
  RESPONSE_TASK_LIST_URL,
} from 'routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {t} from 'i18next';
import {getResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';
import {saveDefendantPropertyToResponseDraft} from 'services/features/common/defendantDetailsService';
import {Claim} from 'models/claim';
import {Party} from 'models/party';
import {PartyPhone} from 'models/PartyPhone';
import {PartyType} from 'models/partyType';
import civilClaimResponseMock from '../../../../../utils/mocks/civilClaimResponseMock.json';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store/response/responseDraftStoreService');
jest.mock('../../../../../../main/services/features/common/defendantDetailsService');

const mockGetResponseDraft = getResponseDraft as jest.Mock;
const mockSaveDefendantProperty = saveDefendantPropertyToResponseDraft as jest.Mock;

const mockResponseDraft = (caseData: Partial<Claim> | Record<string, unknown> = {}) => {
  mockGetResponseDraft.mockResolvedValue({
    claimResponse: {id: 'draft-123', case_data: caseData},
    rawResponse: {draftId: 'draft-123', payload: caseData},
    createdAt: '',
    updatedAt: '',
    expiresAt: '',
  });
};

const buildRespondent = (phone?: PartyPhone): Party => {
  const respondent = new Party();
  respondent.type = PartyType.INDIVIDUAL;
  if (phone) {
    respondent.partyPhone = phone;
  }
  return respondent;
};

describe('Citizen date of birth', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockSaveDefendantProperty.mockResolvedValue(undefined);
    mockResponseDraft({});
  });

  describe('on GET', () => {
    it('should return citizen date of birth page empty when draft has no DOB', async () => {
      mockResponseDraft({});
      await request(app)
        .get(DOB_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_DATE_OF_BIRTH);
          expect(res.text).not.toContain('NaN');
        });
    });

    it('should return citizen date of birth page with information from response draft', async () => {
      mockResponseDraft(civilClaimResponseMock.case_data);
      await request(app)
        .get(DOB_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_DATE_OF_BIRTH);
        });
    });

    it('should return citizen date of birth page when date of birth is stored as a string', async () => {
      mockResponseDraft({
        respondent1: {
          dateOfBirth: '2000-01-02',
        },
      });
      await request(app)
        .get(DOB_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain('value="2"');
          expect(res.text).toContain('value="1"');
          expect(res.text).toContain('value="2000"');
        });
    });

    it('should not render NaN when date of birth from draft is invalid', async () => {
      mockResponseDraft({
        respondent1: {
          dateOfBirth: {
            date: undefined,
          },
        },
      });
      await request(app)
        .get(DOB_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(TestMessages.ENTER_DATE_OF_BIRTH);
          expect(res.text).not.toContain('NaN');
        });
    });

    it('should return http 500 when getResponseDraft fails', async () => {
      mockGetResponseDraft.mockRejectedValueOnce(new Error('Draft error'));
      await request(app)
        .get(DOB_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on POST', () => {
    it('should return errors on no input', async () => {
      await request(app)
        .post(DOB_URL)
        .send('year=')
        .send('month=')
        .send('day=')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_DAY'));
          expect(res.text).toContain(t('ERRORS.VALID_MONTH'));
          expect(res.text).toContain(t('ERRORS.VALID_FOUR_DIGIT_YEAR'));
        });
      expect(mockSaveDefendantProperty).not.toHaveBeenCalled();
    });

    it('should return error on year less than 1872', async () => {
      await request(app)
        .post(DOB_URL)
        .send('year=1871')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_YEAR'));
        });
    });

    it('should return error on empty year', async () => {
      await request(app)
        .post(DOB_URL)
        .send('year=')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_FOUR_DIGIT_YEAR'));
        });
    });

    it('should return error on future date', async () => {
      await request(app)
        .post(DOB_URL)
        .send('year=2400')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_DATE'));
        });
    });

    it('should return error 4 digit year', async () => {
      await request(app)
        .post(DOB_URL)
        .send('year=22')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.VALID_FOUR_DIGIT_YEAR'));
        });
    });

    it('should accept a valid input and save to response draft', async () => {
      mockResponseDraft({respondent1: buildRespondent()});
      await request(app)
        .post(DOB_URL)
        .send('year=2000')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(302);
        });
      expect(mockSaveDefendantProperty).toHaveBeenCalledWith(
        expect.anything(),
        expect.any(String),
        'dateOfBirth',
        expect.anything(),
      );
    });

    it('should redirect to under 18 contact court page', async () => {
      mockResponseDraft({respondent1: buildRespondent()});
      await request(app)
        .post(DOB_URL)
        .send('year=2021')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.text).toContain(`Redirecting to ${AGE_ELIGIBILITY_URL}`);
        });
    });

    it('should redirect to phone number page on valid DOB', async () => {
      mockResponseDraft({respondent1: buildRespondent()});
      await request(app)
        .post(DOB_URL)
        .send('year=1981')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.text).toContain(`Redirecting to ${CITIZEN_PHONE_NUMBER_URL}`);
        });
    });

    it('should return http 500 when saveDefendantPropertyToResponseDraft fails', async () => {
      mockSaveDefendantProperty.mockRejectedValueOnce(new Error('Draft error'));
      await request(app)
        .post(DOB_URL)
        .send('year=1981')
        .send('month=1')
        .send('day=1')
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });

    describe('Redirect to phone-number or task-list screen', () => {
      it('should redirect to task-list screen if phone-number provided', async () => {
        const phone = new PartyPhone('654323472', true);
        mockResponseDraft({respondent1: buildRespondent(phone)});
        await request(app)
          .post(DOB_URL)
          .send('year=1981')
          .send('month=1')
          .send('day=1')
          .expect((res) => {
            expect(res.status).toBe(302);
            expect(res.header.location).toEqual(RESPONSE_TASK_LIST_URL);
          });
      });

      it('should redirect to phone-number screen if phone-number NOT provided', async () => {
        mockResponseDraft({respondent1: buildRespondent()});
        await request(app)
          .post(DOB_URL)
          .send('year=1981')
          .send('month=1')
          .send('day=1')
          .expect((res) => {
            expect(res.status).toBe(302);
            expect(res.header.location).toEqual(CITIZEN_PHONE_NUMBER_URL);
          });
      });

      it('should redirect to phone-number screen if phone-number is empty', async () => {
        const phone = new PartyPhone('', true);
        mockResponseDraft({respondent1: buildRespondent(phone)});
        await request(app)
          .post(DOB_URL)
          .send('year=1981')
          .send('month=1')
          .send('day=1')
          .expect((res) => {
            expect(res.status).toBe(302);
            expect(res.header.location).toEqual(CITIZEN_PHONE_NUMBER_URL);
          });
      });

      it('should redirect to phone-number screen if ccd phone number exist is false', async () => {
        const phone = new PartyPhone('654323472', false);
        mockResponseDraft({respondent1: buildRespondent(phone)});
        await request(app)
          .post(DOB_URL)
          .send('year=1981')
          .send('month=1')
          .send('day=1')
          .expect((res) => {
            expect(res.status).toBe(302);
            expect(res.header.location).toEqual(CITIZEN_PHONE_NUMBER_URL);
          });
      });
    });
  });
});
