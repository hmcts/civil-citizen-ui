import { mockCivilClaimFastTrack } from '../../../../../utils/mockDraftStore';
import {
  CP_FINALISE_TRIAL_ARRANGEMENTS_CONFIRMATION_URL,
  HAS_ANYTHING_CHANGED_URL,
  IS_CASE_READY_URL,
  TRIAL_ARRANGEMENTS_CHECK_YOUR_ANSWERS,
  TRIAL_ARRANGEMENTS_HEARING_DURATION,
} from 'routes/urls';
import {app} from '../../../../../../main/app';
import config from 'config';
import nock from 'nock';
const session = require('supertest-session');
import {t} from 'i18next';
import {getElementsByXPath} from '../../../../../utils/xpathExtractor';
import {getSummarySections} from 'services/features/caseProgression/trialArrangements/checkAnswersService';
import {SummarySections} from 'models/summaryList/summarySections';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {TestMessages} from '../../../../../utils/errorMessageTestConstants';
import {CivilServiceClient} from 'client/civilServiceClient';

jest.mock('../../../../../../main/modules/oidc');
jest.mock('../../../../../../main/modules/draft-store');
jest.mock('../../../../../../main/services/features/caseProgression/trialArrangements/checkAnswersService');
const claim = require('../../../../../utils/mocks/civilClaimResponseMock.json');
const claimId = claim.id;
const testSession = session(app);
const jsdom = require('jsdom');
const {JSDOM} = jsdom;
const mockGetSummarySections = getSummarySections as jest.Mock;
describe('Trial Arrangements check answers - On GET', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  it('should render page successfully with all summary rows', async () => {
    //Given
    app.locals.draftStoreClient = mockCivilClaimFastTrack;
    mockGetSummarySections.mockImplementation(() => {
      return createSummaryListWithAllSectionDetails();
    });
    //When
    const response = await testSession
      .get(TRIAL_ARRANGEMENTS_CHECK_YOUR_ANSWERS.replace(':id', claimId))

    //Then
      .expect((res: { status: unknown; text: unknown; }) => {
        expect(res.status).toBe(200);
        expect(res.text).toContain(t('PAGES.CHECK_YOUR_ANSWER.TITLE'));
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
    expect(isCaseReady[0].textContent).toContain('no');
    expect(hasAnythingChanged.length).toBe(1);
    expect(hasAnythingChanged[0].textContent).toContain('no');
    expect(hasAnythingChanged[0].textContent).toContain('changes');
    expect(otherInformation.length).toBe(1);
    expect(otherInformation[0].textContent).toContain('other information');
  });

  it('should return status 500 when error thrown', async () => {
    mockGetSummarySections.mockImplementation(() => {
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
    mockGetSummarySections.mockImplementation(() => {
      return createSummaryListWithAllSectionDetails();
    });

    const CivilServiceClientServiceMock = jest
      .spyOn(CivilServiceClient.prototype, 'submitDefendantTrialArrangement')
      .mockReturnValue(
        new Promise((resolve, reject) => resolve(claim),
        ),
      );

    await session(app)
      .post(TRIAL_ARRANGEMENTS_CHECK_YOUR_ANSWERS.replace(':id', claimId))
      .expect((res: {status: unknown, header: {location: unknown}, text: unknown;}) => {
        expect(res.status).toBe(302);
        expect(res.header.location).toEqual(CP_FINALISE_TRIAL_ARRANGEMENTS_CONFIRMATION_URL.replace(':id', claim.id));
        expect(CivilServiceClientServiceMock).toBeCalled();
      });
  });
});

export function createSummaryListWithAllSectionDetails(): SummarySections {
  return {
    sections: [{
      title: t('PAGES.CHECK_YOUR_ANSWER.RESPONSE_TITLE'),
      summaryList: {
        rows: [
          {
            key: {
              text: t('PAGES.IS_CASE_READY.IS_CASE_READY'),
            },
            value: {
              text: 'no',
            },
            actions: {
              items: [{
                href: constructResponseUrlWithIdParams(claimId, IS_CASE_READY_URL),
                text: 'Change',
              }],
            },
          },
          {
            key: {
              text: t('PAGES.FINALISE_TRIAL_ARRANGEMENTS.ARE_THERE_ANY_CHANGES'),
            },
            value: {
              text: '<p>no</p><hr class="govuk-section-break--visible" ><p>changes</p>',
            },
            actions: {
              items: [{
                href: constructResponseUrlWithIdParams(claimId, HAS_ANYTHING_CHANGED_URL),
                text: 'Change',
              }],
            },
          },
          {
            key: {
              text: t('PAGES.FINALISE_TRIAL_ARRANGEMENTS.OTHER_INFORMATION_TITLE'),
            },
            value: {
              text: 'other information',
            },
            actions: {
              items: [{
                href: constructResponseUrlWithIdParams(claimId, TRIAL_ARRANGEMENTS_HEARING_DURATION),
                text: 'Change',
              }],
            },
          },
        ],
      },
    }],
  };
}
