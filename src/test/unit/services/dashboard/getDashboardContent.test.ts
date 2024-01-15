import {Claim} from 'models/claim';
import {getClaimantNotifications, getDefendantNotifications} from 'services/dashboard/getDashboardContent';
import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {CaseProgression} from 'models/caseProgression/caseProgression';
import {ApplyHelpFeesReferenceForm} from 'form/models/caseProgression/hearingFee/applyHelpFeesReferenceForm';
import {YesNo} from 'form/models/yesNo';
//import {t} from 'i18next';
import {CaseProgressionHearing} from 'models/caseProgression/caseProgressionHearing';
import {HearingFeeInformation} from 'models/caseProgression/hearingFee/hearingFee';
import {FIXED_DATE} from '../../../utils/dateUtils';
import {CaseState} from 'form/models/claimDetails';
import * as dashboardCache from 'modules/draft-store/getDashboardCache';
import {Notifications} from 'models/caseProgression/notifications';

const lang = 'en';
const defendantResponseNotificationContent = [{data: {externalLink: true, href: '/notification', text: 'PAGES.CLAIM_SUMMARY.VIEW_CLAIM', textAfter: '', textBefore: 'PAGES.LATEST_UPDATE_CONTENT.DEFENDANT_HAS_UNTIL_TO_RESPOND', variables: ''}, type: 'link'}] as ClaimSummarySection;
const helpWithFeesNotificationContent = [{data: {text: 'PAGES.DASHBOARD.NOTIFICATIONS.HELP_WITH_FEES.HEARING_CONTENT', classes: undefined, variables: undefined}, type: 'p'}] as ClaimSummarySection;
const hearingFeeNotificationContent = [{data: {externalLink: false, href: '/case/1234567890/case-progression/pay-hearing-fee', text: 'PAGES.DASHBOARD.NOTIFICATIONS.HEARINGS.TEXT', textAfter: 'PAGES.DASHBOARD.NOTIFICATIONS.HEARINGS.PAY_FEE', textBefore: 'PAGES.DASHBOARD.NOTIFICATIONS.HEARINGS.TEXT_BEFORE', variables: undefined}, type: 'link'}] as ClaimSummarySection;
const youHaventRespondedNotificationContent = [{data: {externalLink: false, href: '#', text: 'BUTTONS.RESPOND_TO_CLAIM', textAfter: undefined, textBefore: 'PAGES.LATEST_UPDATE_CONTENT.YOU_NEED_TO_RESPOND_BEFORE_DEADLINE', variables: undefined}, type: 'link'}] as ClaimSummarySection;

describe('getDashboardContent', () => {
  describe('getClaimantNotifications', () => {
    it('with hearing fee notification if fee present', async () => {
      //Given
      const claim = new Claim();
      claim.id = '1234567890';
      claim.caseProgressionHearing = new CaseProgressionHearing(null, null, null, null, null, new HearingFeeInformation({calculatedAmountInPence: '1000', code: 'test', version: '1'}, FIXED_DATE));
      const spyOn = jest.spyOn(dashboardCache, 'getNotificationFromCache');
      spyOn.mockImplementationOnce(() => {return null;});

      //When
      const claimantNotifications = await getClaimantNotifications(claim.id, claim, 'en');

      //Then
      expect(claimantNotifications[0].title).toEqual('PAGES.DASHBOARD.HEARINGS.PAY_FEE');
      expect(claimantNotifications[0].content).toEqual(hearingFeeNotificationContent);
      expect(claimantNotifications[1].title).toEqual('PAGES.LATEST_UPDATE_CONTENT.WAIT_DEFENDANT_TO_RESPOND');
      expect(claimantNotifications[1].content).toEqual(defendantResponseNotificationContent);
      expect(claimantNotifications[2]).toBeUndefined();

    });

    it('without hearing fee notification if fee not present', async () => {
      //Given
      const claim = new Claim();
      claim.id = '1234567890';
      claim.caseProgressionHearing = new CaseProgressionHearing(null, null, null, null, null);
      const spyOn = jest.spyOn(dashboardCache, 'getNotificationFromCache');
      spyOn.mockImplementationOnce(() => {return null;});
      //When
      const claimantNotifications = await getClaimantNotifications(claim.id, claim, 'en');

      //Then
      expect(claimantNotifications[0].title).toEqual('PAGES.LATEST_UPDATE_CONTENT.WAIT_DEFENDANT_TO_RESPOND');
      expect(claimantNotifications[0].content).toEqual(defendantResponseNotificationContent);
      expect(claimantNotifications[1]).toBeUndefined();

    });

    it('return cached notifications if present', async () => {
      //Given
      const claim = new Claim();
      claim.id = '1234567890';
      claim.caseProgressionHearing = new CaseProgressionHearing(null, null, null, null, null);
      const spyOn = jest.spyOn(dashboardCache, 'getNotificationFromCache');
      spyOn.mockImplementationOnce(async () => {return {items: [{title: 'Received from Cache', content: null}]} as Notifications;});
      //When
      const claimantNotifications = await getClaimantNotifications(claim.id, claim, 'en');

      //Then
      expect(claimantNotifications[0].title).toEqual('Received from Cache');

    });

    it('with help with fees notification if reference number present', async () => {
      //Given
      const claim = new Claim();
      claim.id = '1234567890';
      claim.caseProgression = {helpFeeReferenceNumberForm: new ApplyHelpFeesReferenceForm(YesNo.YES, '12341234123')} as CaseProgression;
      const spyOn = jest.spyOn(dashboardCache, 'getNotificationFromCache');
      spyOn.mockImplementationOnce(() => {return null;});

      //When
      const claimantNotifications = await getClaimantNotifications(claim.id, claim, lang);

      //Then
      expect(claimantNotifications[0].title).toEqual('PAGES.DASHBOARD.NOTIFICATIONS.HELP_WITH_FEES.TITLE');
      expect(claimantNotifications[0].content).toEqual(helpWithFeesNotificationContent);
      expect(claimantNotifications[1].title).toEqual('PAGES.LATEST_UPDATE_CONTENT.WAIT_DEFENDANT_TO_RESPOND');

    });

    it('without help with fees notification if reference number not present', async () => {
      //Given
      const claim = new Claim();
      claim.id = '1234567890';
      claim.caseProgression = {helpFeeReferenceNumberForm: new ApplyHelpFeesReferenceForm(YesNo.NO)} as CaseProgression;
      const spyOn = jest.spyOn(dashboardCache, 'getNotificationFromCache');
      spyOn.mockImplementationOnce(() => {return null;});

      //When
      const claimantNotifications = await getClaimantNotifications(claim.id, claim, lang);

      //Then
      expect(claimantNotifications[0].title).toEqual('PAGES.LATEST_UPDATE_CONTENT.WAIT_DEFENDANT_TO_RESPOND');
      expect(claimantNotifications[1]).toBeUndefined();
    });
  });
  describe('getDefendantNotifications', () => {
    it('without hearing fee notification if fee present', async () => {
      //Given
      const claim = new Claim();
      claim.id = '1234567890';
      claim.ccdState = CaseState.PENDING_CASE_ISSUED;
      claim.caseProgressionHearing = new CaseProgressionHearing(null, null, null, null, null, new HearingFeeInformation({calculatedAmountInPence: '1000', code: 'test', version: '1'}, FIXED_DATE));
      const spyOn = jest.spyOn(dashboardCache, 'getNotificationFromCache');
      spyOn.mockImplementationOnce(() => {return null;});

      //When
      const defendantNotifications = await getDefendantNotifications(claim.id, claim, 'en');

      //Then
      expect(defendantNotifications[0].title).toEqual('PAGES.LATEST_UPDATE_CONTENT.YOU_HAVENT_RESPONDED_TO_CLAIM');
      expect(defendantNotifications[0].content).toEqual(youHaventRespondedNotificationContent);
      expect(defendantNotifications[1]).toBeUndefined();
    });

    it('without hearing fee if fee not present', async () => {
      //Given
      const claim = new Claim();
      claim.id = '1234567890';
      claim.caseProgressionHearing = new CaseProgressionHearing(null, null, null, null, null);
      const spyOn = jest.spyOn(dashboardCache, 'getNotificationFromCache');
      spyOn.mockImplementationOnce(() => {return null;});

      //When
      const defendantNotifications = await getDefendantNotifications(claim.id, claim, 'en');

      //Then
      expect(defendantNotifications[0]).toBeUndefined();
    });

    it('return cached notifications if present', async () => {
      //Given
      const claim = new Claim();
      claim.id = '1234567890';
      claim.caseProgressionHearing = new CaseProgressionHearing(null, null, null, null, null);
      const spyOn = jest.spyOn(dashboardCache, 'getNotificationFromCache');
      spyOn.mockImplementationOnce(async () => {return {items: [{title: 'Received from Cache', content: null}]} as Notifications;});
      //When
      const defendantNotifications = await getDefendantNotifications(claim.id, claim, 'en');

      //Then
      expect(defendantNotifications[0].title).toEqual('Received from Cache');

    });
  });
});
