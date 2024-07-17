import {app} from '../../../../../../main/app';
import request from 'supertest';
import config from 'config';
import nock from 'nock';
import {
  DQ_DEFENDANT_WITNESSES_URL,
  DQ_NEXT_12MONTHS_CAN_NOT_HEARING_URL,
} from 'routes/urls';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {t} from 'i18next';
import {YesNo} from 'form/models/yesNo';
import {Claim} from 'models/claim';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('modules/draft-store/draftStoreService');
const mockGetCaseData = getCaseDataFromStore as jest.Mock;

const otherWitnessMock = {
  'id': 1645882162449409,
  'jurisdiction': 'CIVIL',
  'case_type_id': 'CIVIL',
  'created_date': '2022-03-01T13:29:22.448',
  'last_modified': '2022-03-01T13:29:24.971',
  'state': 'PENDING_CASE_ISSUED',
  'security_classification': 'PUBLIC',
  'case_data': {
    'directionQuestionnaire': {
      'witnesses': {
        'otherWitnesses': {
          'option': '',
          'witnessItems': [{}],
        },
      },
    },
  },
};

describe('Other Witnesses', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  describe('on Get', () => {
    test('should return on your other witnesses page successfully', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), otherWitnessMock.case_data);
      });
      await request(app).get(DQ_DEFENDANT_WITNESSES_URL)
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('PAGES.OTHER_WITNESSES.PAGE_TITLE'));
        });
    });

    it('should return status 500 when error thrown', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .get(DQ_DEFENDANT_WITNESSES_URL)
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });

  describe('on Post', () => {
    test('should redirect with correct input and redirect to availability dates in next 12 months screen', async () => {
      mockGetCaseData.mockImplementation(async () => {
        return Object.assign(new Claim(), otherWitnessMock.case_data);
      });
      await request(app)
        .post(DQ_DEFENDANT_WITNESSES_URL)
        .send({option: YesNo.NO, witnessItems: []})
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(DQ_NEXT_12MONTHS_CAN_NOT_HEARING_URL);
        });
    });

    test('should return errors when option selected equal no', async () => {
      await request(app)
        .post(DQ_DEFENDANT_WITNESSES_URL)
        .send({option: undefined, witnessItems: [{}]})
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.DEFENDANT_WITNESS_SELECT_OTHER'));
        });
    });

    test('should return errors when option selected equal yes and no witness details provided', async () => {
      await request(app)
        .post(DQ_DEFENDANT_WITNESSES_URL)
        .send({
          option: 'yes',
          witnessItems: [
            {
              details: '',
              email: '',
              firstName: '',
              lastName: '',
              telephone: '',
            }],
        })
        .expect((res) => {
          expect(res.status).toBe(200);
          expect(res.text).toContain(t('ERRORS.DEFENDANT_WITNESS_ENTER_FIRST_NAME'));
          expect(res.text).toContain(t('ERRORS.DEFENDANT_WITNESS_ENTER_LAST_NAME'));
          expect(res.text).toContain(t('ERRORS.DEFENDANT_WITNESS_WHAT_THEY_WITNESSED'));
        });
    });

    test('should redirect when option selected equal yes and other witness details are provided', async () => {
      await request(app)
        .post(DQ_DEFENDANT_WITNESSES_URL)
        .send({
          option: 'yes',
          witnessItems: [
            {
              details: 'Details here...',
              email: 'jane.clarke@version1.com',
              firstName: 'Jane',
              lastName: 'Clarke',
              telephone: '01632960001',
            }],
        })
        .expect((res) => {
          expect(res.status).toBe(302);
          expect(res.header.location).toEqual(DQ_NEXT_12MONTHS_CAN_NOT_HEARING_URL);
        });
    });

    it('should return status 500 when error thrown', async () => {
      mockGetCaseData.mockImplementation(async () => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });
      await request(app)
        .post(DQ_DEFENDANT_WITNESSES_URL)
        .send({
          option: 'yes',
          witnessItems: [
            {
              details: 'Details here...',
              email: 'jane.clarke@version1.com',
              firstName: 'Jane',
              lastName: 'Clarke',
              telephone: '01632960001',
            }],
        })
        .expect((res) => {
          expect(res.status).toBe(500);
          expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
        });
    });
  });
});
