import i18next from 'i18next';
import en from 'modules/i18n/locales/en.json';
import {CaseRole} from 'form/models/caseRoles';
import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {Claim} from 'models/claim';
import {ApplicationResponse} from 'models/generalApplication/applicationResponse';
import {ApplicationState} from 'models/generalApplication/applicationSummary';
import {buildRespondentApplicationSummaryRow} from 'services/features/generalApplication/response/generalApplicationResponseService';
import {addApplicationStatus} from 'services/features/generalApplication/viewApplication/addViewApplicationRows';
import mockApplication from '../../../../utils/mocks/applicationMock.json';

jest.mock('modules/draft-store');
jest.mock('modules/draft-store/draftStoreService');
jest.mock('app/auth/launchdarkly/launchDarklyClient');

describe('General application status wording', () => {
  beforeAll(async () => {
    await i18next.init({
      lng: 'en',
      fallbackLng: 'en',
      resources: {en: {translation: en}},
    });
  });

  describe.each([
    {state: ApplicationState.LISTING_FOR_A_HEARING, wording: 'List for hearing'},
    {state: ApplicationState.HEARING_SCHEDULED, wording: 'Hearing Scheduled'},
  ])('$state', ({state, wording}) => {
    it.each([YesNoUpperCamelCase.YES, YesNoUpperCamelCase.NO])(
      'uses the English summary wording when parentClaimantIsApplicant is %s',
      (parentClaimantIsApplicant) => {
        const application = Object.assign(new ApplicationResponse(), mockApplication, {
          state,
          case_data: {...mockApplication.case_data, parentClaimantIsApplicant},
        });
        const claim = new Claim();
        claim.caseRole = CaseRole.DEFENDANT;
        claim.generalApplications = [{
          id: 'application',
          value: {
            caseLink: {CaseReference: application.id},
            generalAppSubmittedDateGAspec: new Date('2024-05-29T14:39:28.483971'),
          },
        }];

        const row = buildRespondentApplicationSummaryRow('12345', 'en', claim)(application, 0);

        expect(row.state).toBe(wording);
      },
    );

    it('uses the English wording in the shared application-detail status row', () => {
      const application = Object.assign(new ApplicationResponse(), mockApplication, {state});

      const rows = addApplicationStatus(application, 'en');

      expect(rows).toHaveLength(1);
      expect(rows[0].value.html).toBe(wording);
    });
  });
});
