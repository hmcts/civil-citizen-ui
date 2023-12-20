import {Claim} from 'models/claim';
import {getClaimantNotifications} from 'services/dashboard/getDashboardContent';
import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {CaseProgression} from 'models/caseProgression/caseProgression';
import {ApplyHelpFeesReferenceForm} from 'form/models/caseProgression/hearingFee/applyHelpFeesReferenceForm';
import {YesNo} from 'form/models/yesNo';
import {t} from 'i18next';

const lang = 'en';
jest.mock('i18next');
jest.mock('common/utils/formatDocumentURL');
const mockTranslate = t as jest.Mock;

mockTranslate.mockImplementation((key: string[]) => {
  return key.toString();
});

const helpWithFeesNotificationContent = [{data: {text: 'PAGES.DASHBOARD.NOTIFICATIONS.HELP_WITH_FEES.HEARING_CONTENT', classes: undefined, variables: undefined}, type: 'p'}] as ClaimSummarySection;

describe('getDashboardContent', () => {
  describe('getClaimantNotifications', () => {
    it('with help with fees notification if reference number present', async () => {
      //Given
      const claim = new Claim();
      claim.id = '1234567890';
      claim.caseProgression = {helpFeeReferenceNumberForm: new ApplyHelpFeesReferenceForm(YesNo.YES, '12341234123')} as CaseProgression;

      //When
      const claimantNotifications = getClaimantNotifications(claim, lang);

      //Then
      expect(claimantNotifications[0].title).toEqual('PAGES.DASHBOARD.NOTIFICATIONS.HELP_WITH_FEES.TITLE');
      expect(claimantNotifications[0].content).toEqual(helpWithFeesNotificationContent);
      expect(claimantNotifications[1].title).toEqual('PAGES.LATEST_UPDATE_CONTENT.WAIT_DEFENDANT_TO_RESPOND');
      expect(claimantNotifications[2].title).toEqual('PAGES.LATEST_UPDATE_CONTENT.WAIT_DEFENDANT_TO_RESPOND');

    });

    it('without help with fees notification if reference number not present', async () => {
      //Given
      const claim = new Claim();
      claim.id = '1234567890';
      claim.caseProgression = {helpFeeReferenceNumberForm: new ApplyHelpFeesReferenceForm(YesNo.NO)} as CaseProgression;

      //When
      const claimantNotifications = getClaimantNotifications(claim, lang);

      //Then
      expect(claimantNotifications[0].title).toEqual('PAGES.LATEST_UPDATE_CONTENT.WAIT_DEFENDANT_TO_RESPOND');
      expect(claimantNotifications[1].title).toEqual('PAGES.LATEST_UPDATE_CONTENT.WAIT_DEFENDANT_TO_RESPOND');

    });
  });
});
