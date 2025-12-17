import {mockCivilClaim} from '../../../../../utils/mockDraftStore';
import {
  REQUEST_FOR_RECONSIDERATION_CONFIRMATION_URL,
  REQUEST_FOR_RECONSIDERATION_CYA_URL,
} from 'routes/urls';
import {app} from '../../../../../../main/app';
import config from 'config';
import nock from 'nock';
const session = require('supertest-session');
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {CivilServiceClient} from 'client/civilServiceClient';
import {
  getClaimRequestForReconsideration,
} from '../../../../../utils/mockClaimForCheckAnswers';
import * as checkAnswersService from '../../../../../../main/services/features/caseProgression/requestForReconsideration/requestForReviewService';
jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/app/auth/launchdarkly/launchDarklyClient');

const claim = getClaimRequestForReconsideration();
const claimId = '1692795793361508';
const testSession = session(app);

describe('Request for Reconsideration check answers - On GET', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  it('should render page successfully in English with all sections and summary rows', async () => {
    //Given
    app.locals.draftStoreClient = mockCivilClaim;
    //When
    await testSession
      .get(REQUEST_FOR_RECONSIDERATION_CYA_URL.replace(':id', claimId)).query({lang: 'en'})
    //Then
      .expect((res: { status: unknown; text: unknown; }) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Check your answers');
        expect(res.text).toContain('Case number: 1692 7957 9336 1508');
        expect(res.text).toContain('Claim amount:');
      });
  });

  it('should render page successfully in Welsh with all sections and summary rows if Welsh query', async () => {
    //Given
    app.locals.draftStoreClient = mockCivilClaim;
    //When
    await testSession
      .get(REQUEST_FOR_RECONSIDERATION_CYA_URL.replace(':id', claimId)).query({lang: 'cy'})
      //Then
      .expect((res: { status: unknown; text: unknown; }) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain('Gwiriwch eich atebion');
        expect(res.text).toContain('Rhif yr achos: 1692 7957 9336 1508');
        expect(res.text).toContain('Swm yr hawliad:');
      });
  });

  it('should return status 500 when error thrown', async () => {
    jest.spyOn(checkAnswersService, 'getSummarySections')
      .mockImplementation(() => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });

    await session(app)
      .get(REQUEST_FOR_RECONSIDERATION_CYA_URL)
      .expect((res: Response) => {
        expect(res.status).toBe(500);
        expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
      });
  });
});

describe('Request for Reconsideration - on POST', () => {
  beforeEach(() => {
    app.locals.draftStoreClient = mockCivilClaim;
  });

  it('should call ccd when submitted and redirected to the confirmation page', async () => {
    const CivilServiceClientServiceMock = jest
      .spyOn(CivilServiceClient.prototype, 'submitRequestForReconsideration')
      .mockReturnValue(
        new Promise((resolve) => resolve(claim),
        ),
      );

    await session(app)
      .post(REQUEST_FOR_RECONSIDERATION_CYA_URL.replace(':id', claimId))
      .expect((res: {status: unknown, header: {location: unknown}, text: unknown;}) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toEqual(REQUEST_FOR_RECONSIDERATION_CONFIRMATION_URL.replace(':id', claimId));
        expect(CivilServiceClientServiceMock).toBeCalled();
      });
  });
});
