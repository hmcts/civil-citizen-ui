import { mockCivilClaimFastTrack } from '../../../../../utils/mockDraftStore';
import {
  CP_FINALISE_TRIAL_ARRANGEMENTS_CONFIRMATION_URL,
  TRIAL_ARRANGEMENTS_CHECK_YOUR_ANSWERS,
} from 'routes/urls';
import {app} from '../../../../../../main/app';
import config from 'config';
import nock from 'nock';
const session = require('supertest-session');
import {t} from 'i18next';
import {getElementsByXPath} from '../../../../../utils/xpathExtractor';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {CivilServiceClient} from 'client/civilServiceClient';
import {getClaimWithDefendantTrialArrangements} from '../../../../../utils/mockClaimForCheckAnswers';
import * as checkAnswersService from '../../../../../../main/services/features/caseProgression/trialArrangements/checkAnswersService';
jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');

const claim = getClaimWithDefendantTrialArrangements();
const claimId = '1692795793361508';
const testSession = session(app);
const jsdom = require('jsdom');
const {JSDOM} = jsdom;

describe('Trial Arrangements check answers - On GET', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  it('should render page successfully with all sections and summary rows', async () => {
    //Given
    app.locals.draftStoreClient = mockCivilClaimFastTrack;
    //When
    const response = await testSession
      .get(TRIAL_ARRANGEMENTS_CHECK_YOUR_ANSWERS.replace(':id', claimId)).query({lang: 'en'})
    //Then
      .expect((res: { status: unknown; text: unknown; }) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(t('PAGES.CHECK_YOUR_ANSWER.TITLE'));
        expect(res.text).toContain('Claim number: 1692 7957 9336 1508');
        expect(res.text).toContain('Mr. Jan Clark v Version 1');
      });
    const dom = new JSDOM(response.text);
    const htmlDocument = dom.window.document;
    const header = getElementsByXPath("//h1[@class='govuk-heading-l']", htmlDocument);
    const isCaseReady = getElementsByXPath(
      "//dd[@class='govuk-summary-list__value' and preceding-sibling::dt[contains(text(),'Is the case ready for trial')]]", htmlDocument);
    const hasAnythingChanged = getElementsByXPath(
      "//dd[@class='govuk-summary-list__value' and preceding-sibling::dt[contains(text(),'Are there any changes to support with access needs or vulnerability for anyone attending a court hearing')]]", htmlDocument);
    const otherInformation = getElementsByXPath(
      "//dd[@class='govuk-summary-list__value' and preceding-sibling::dt[contains(text(),'Other information')]]", htmlDocument);
    expect(header.length).toBe(1);
    expect(header[0].textContent).toBe(t('PAGES.CHECK_YOUR_ANSWER.TITLE'));
    expect(isCaseReady.length).toBe(1);
    expect(isCaseReady[0].textContent).toContain('Yes');
    expect(hasAnythingChanged.length).toBe(1);
    expect(hasAnythingChanged[0].textContent).toContain('Yes');
    expect(hasAnythingChanged[0].textContent).toContain('Changed');
    expect(otherInformation.length).toBe(1);
    expect(otherInformation[0].textContent).toContain('Other Information');
  });

  it('should return status 500 when error thrown', async () => {
    jest.spyOn(checkAnswersService, 'getSummarySections')
      .mockImplementation(() => {
        throw new Error(TestMessages.REDIS_FAILURE);
      });

    await session(app)
      .get(TRIAL_ARRANGEMENTS_CHECK_YOUR_ANSWERS)
      .expect((res: Response) => {
        expect(res.status).toBe(500);
        expect(res.text).toContain(TestMessages.SOMETHING_WENT_WRONG);
      });
  });
});

describe('Trial Arrangements check answers - on POST', () => {
  beforeEach(() => {
    app.locals.draftStoreClient = mockCivilClaimFastTrack;
  });

  it('should call ccd when submitted and redirected to the confirmation page', async () => {
    const CivilServiceClientServiceMock = jest
      .spyOn(CivilServiceClient.prototype, 'submitTrialArrangement')
      .mockReturnValue(
        new Promise((resolve) => resolve(claim),
        ),
      );

    await session(app)
      .post(TRIAL_ARRANGEMENTS_CHECK_YOUR_ANSWERS.replace(':id', claimId))
      .expect((res: {status: unknown, header: {location: unknown}, text: unknown;}) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toEqual(CP_FINALISE_TRIAL_ARRANGEMENTS_CONFIRMATION_URL.replace(':id', claimId));
        expect(CivilServiceClientServiceMock).toBeCalled();
      });
  });
});
