import config from 'config';
import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../main/app';
import {CP_FINALISE_TRIAL_ARRANGEMENTS_CONFIRMATION_URL} from 'routes/urls';
import {t} from 'i18next';
import {TestMessages} from '../../../../utils/errorMessageTestConstants';
import {Claim} from 'models/claim';
import * as utilityService from 'modules/utilityService';
import {YesNo} from 'form/models/yesNo';
import { CaseProgression } from 'common/models/caseProgression/caseProgression';
import {IsCaseReadyForm} from 'models/caseProgression/trialArrangements/isCaseReadyForm';
import {Party} from 'models/party';
import {PartyType} from 'models/partyType';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');
jest.mock('../../../../../main/modules/utilityService');

describe('Confirm trial arrangements - On GET', () => {
  const mockGetClaimById = utilityService.getClaimById as jest.Mock;
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  const confirmationUrl = CP_FINALISE_TRIAL_ARRANGEMENTS_CONFIRMATION_URL.replace(':id', '1111');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  it('should render page successfully', async () => {
    mockGetClaimById.mockImplementation(async () => {
      const claim = new Claim();
      const party = new Party();
      party.type = PartyType.ORGANISATION;
      claim.applicant1 = party;
      claim.caseProgression = new CaseProgression();

      claim.caseProgression.isCaseReadyTrialOrHearing = new IsCaseReadyForm(YesNo.NO);
      return claim;
    });
    await request(app).get(confirmationUrl).expect((res) => {
      expect(res.status).toBe(200);
      expect(res.text).toContain(t('PAGES.FINALISE_TRIAL_ARRANGEMENTS.CONFIRMATION.WHAT_HAPPENS_NEXT'));
    });
  });

  it('should return 500 error page for redis failure', async () => {
    mockGetClaimById.mockImplementation(async () => {
      throw new Error(TestMessages.REDIS_FAILURE);
    });
    await request(app).get(confirmationUrl).expect((res) => {
      expect(res.status).toBe(500);
      expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
    });
  });
});
