import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../main/app';
import {CP_FINALISE_TRIAL_ARRANGEMENTS_CONFIRMATION_URL} from 'routes/urls';
import {t} from 'i18next';
import {mockCivilClaim, mockRedisFailure} from '../../../../utils/mockDraftStore';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');

describe('Confirm trial arrangements - On GET', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  const confirmationUrl = CP_FINALISE_TRIAL_ARRANGEMENTS_CONFIRMATION_URL.replace(':id', '1111');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  it('should render page successfully', async () => {
    app.locals.draftStoreClient = mockCivilClaim;
    await request(app).get(confirmationUrl).expect((res) => {
      expect(res.status).toBe(200);
      expect(res.text).toContain(t('PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.WHAT_HAPPENS_NEXT'));
    });
  });

  it('should return 500 error page for redis failure', async () => {
    app.locals.draftStoreClient = mockRedisFailure;
    await request(app).get(confirmationUrl).expect((res) => {
      expect(res.status).toBe(500);
      expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
    });
  });
});
