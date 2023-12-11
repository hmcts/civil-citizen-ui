import {Claim} from 'models/claim';
import {CaseProgressionHearing} from 'models/caseProgression/caseProgressionHearing';
import {HearingFeeInformation} from 'models/caseProgression/hearingFee/hearingFee';
import {FIXED_DATE} from '../../../../utils/dateUtils';
import {generateNewDashboard} from 'services/features/caseProgression/dashboardService';
import {Task} from 'models/taskList/task';
import {CaseRole} from 'form/models/caseRoles';

const viewHearingsTask = {description: 'PAGES.DASHBOARD.HEARINGS.VIEW_HEARINGS', isCheckTask: false, status: 'NOT_AVAILABLE_YET', statusColor: 'govuk-tag--grey', url: '#'} as Task;
const uploadDocumentsTask = {description: 'PAGES.DASHBOARD.HEARINGS.UPLOAD_DOCUMENTS', isCheckTask: false, status: 'NOT_AVAILABLE_YET', statusColor: 'govuk-tag--grey', url: '#'} as Task;
const viewDocumentsTask = {description: 'PAGES.DASHBOARD.HEARINGS.VIEW_DOCUMENTS', isCheckTask: false, status: 'NOT_AVAILABLE_YET', statusColor: 'govuk-tag--grey', url: '#'} as Task;
const uploadBundlesTask = {description: 'PAGES.DASHBOARD.HEARINGS.VIEW_BUNDLE', isCheckTask: false, status: 'NOT_AVAILABLE_YET', statusColor: 'govuk-tag--grey', url: '#'} as Task;
const addTrialArrangementsTask = {description: 'PAGES.DASHBOARD.HEARINGS.ADD_TRIAL', isCheckTask: false, status: 'NOT_AVAILABLE_YET', statusColor: 'govuk-tag--grey', url: '#'} as Task;
const hearingFeeActionableTask = {description: 'PAGES.DASHBOARD.HEARINGS.PAY_FEE', isCheckTask: false, status: 'ACTION_NEEDED', statusColor: 'govuk-tag--red', url: '/case/1234567890/case-progression/pay-hearing-fee', helpText: 'PAGES.DASHBOARD.HEARINGS.PAY_FEE_DEADLINE'} as Task;
const hearingFeeTask = {description: 'PAGES.DASHBOARD.HEARINGS.PAY_FEE', isCheckTask: false, status: 'NOT_AVAILABLE_YET', statusColor: 'govuk-tag--grey', url: '#'} as Task;
describe('dashboardService', () => {
  describe('generateNewDashboard', () => {
    describe('as Claimant', () => {
      it('with hearing fee actionable + trial arrangements if hearing fee + fast track type', () => {
        //Given
        const claim = new Claim();
        claim.id = '1234567890';
        claim.caseProgressionHearing = new CaseProgressionHearing(null, null, null, null, null, new HearingFeeInformation({calculatedAmountInPence: '1000', code: 'test', version: '1'}, FIXED_DATE));
        claim.caseRole = CaseRole.CLAIMANT;
        claim.totalClaimAmount = 12345;
        //When
        const claimantNotifications = generateNewDashboard(claim);

        //Then
        expect(claimantNotifications[0].title).toEqual('PAGES.DASHBOARD.HEARINGS.TITLE');
        expect(claimantNotifications[0].tasks[0]).toEqual(viewHearingsTask);
        expect(claimantNotifications[0].tasks[1]).toEqual(uploadDocumentsTask);
        expect(claimantNotifications[0].tasks[2]).toEqual(viewDocumentsTask);
        expect(claimantNotifications[0].tasks[3]).toEqual(addTrialArrangementsTask);
        expect(claimantNotifications[0].tasks[4]).toEqual(hearingFeeActionableTask);
        expect(claimantNotifications[0].tasks[5]).toEqual(uploadBundlesTask);

      });

      it('without hearing fee inactive + trial arrangements if no hearing fee + fast track type ', async () => {
        //Given
        const claim = new Claim();
        claim.id = '1234567890';
        claim.caseProgressionHearing = new CaseProgressionHearing(null, null, null, null, null, null);
        claim.caseRole = CaseRole.CLAIMANT;
        claim.totalClaimAmount = 12345;
        //When
        const claimantNotifications = generateNewDashboard(claim);

        //Then
        expect(claimantNotifications[0].title).toEqual('PAGES.DASHBOARD.HEARINGS.TITLE');
        expect(claimantNotifications[0].tasks[0]).toEqual(viewHearingsTask);
        expect(claimantNotifications[0].tasks[1]).toEqual(uploadDocumentsTask);
        expect(claimantNotifications[0].tasks[2]).toEqual(viewDocumentsTask);
        expect(claimantNotifications[0].tasks[3]).toEqual(addTrialArrangementsTask);
        expect(claimantNotifications[0].tasks[4]).toEqual(hearingFeeTask);
        expect(claimantNotifications[0].tasks[5]).toEqual(uploadBundlesTask);

      });

      it('with hearing fee inactive + without trial arrangements if no hearing fee + small claim track type ', async () => {
        //Given
        const claim = new Claim();
        claim.id = '1234567890';
        claim.caseProgressionHearing = new CaseProgressionHearing(null, null, null, null, null, null);
        claim.caseRole = CaseRole.CLAIMANT;
        claim.totalClaimAmount = 900;
        //When
        const claimantNotifications = generateNewDashboard(claim);

        //Then
        expect(claimantNotifications[0].title).toEqual('PAGES.DASHBOARD.HEARINGS.TITLE');
        expect(claimantNotifications[0].tasks[0]).toEqual(viewHearingsTask);
        expect(claimantNotifications[0].tasks[1]).toEqual(uploadDocumentsTask);
        expect(claimantNotifications[0].tasks[2]).toEqual(viewDocumentsTask);
        expect(claimantNotifications[0].tasks[3]).toEqual(hearingFeeTask);
        expect(claimantNotifications[0].tasks[4]).toEqual(uploadBundlesTask);

      });
    });
    describe('as Defendant', () => {
      describe('getDefendantNotifications', () => {
        it('with no hearing fee + trial arrangements if hearing fee present + fast track type', () => {
          //Given
          const claim = new Claim();
          claim.id = '1234567890';
          claim.caseProgressionHearing = new CaseProgressionHearing(null, null, null, null, null, new HearingFeeInformation({calculatedAmountInPence: '1000', code: 'test', version: '1'}, FIXED_DATE));
          claim.caseRole = CaseRole.DEFENDANT;
          claim.totalClaimAmount = 12345;
          //When
          const claimantNotifications = generateNewDashboard(claim);

          //Then
          expect(claimantNotifications[0].title).toEqual('PAGES.DASHBOARD.HEARINGS.TITLE');
          expect(claimantNotifications[0].tasks[0]).toEqual(viewHearingsTask);
          expect(claimantNotifications[0].tasks[1]).toEqual(uploadDocumentsTask);
          expect(claimantNotifications[0].tasks[2]).toEqual(viewDocumentsTask);
          expect(claimantNotifications[0].tasks[3]).toEqual(addTrialArrangementsTask);
          expect(claimantNotifications[0].tasks[4]).toEqual(uploadBundlesTask);

        });

        it('without hearing fee + without trial arrangements if no hearing fee + small claim track type ', async () => {
          //Given
          const claim = new Claim();
          claim.id = '1234567890';
          claim.caseProgressionHearing = new CaseProgressionHearing(null, null, null, null, null, null);
          claim.caseRole = CaseRole.DEFENDANT;
          claim.totalClaimAmount = 900;
          //When
          const claimantNotifications = generateNewDashboard(claim);

          //Then
          expect(claimantNotifications[0].title).toEqual('PAGES.DASHBOARD.HEARINGS.TITLE');
          expect(claimantNotifications[0].tasks[0]).toEqual(viewHearingsTask);
          expect(claimantNotifications[0].tasks[1]).toEqual(uploadDocumentsTask);
          expect(claimantNotifications[0].tasks[2]).toEqual(viewDocumentsTask);
          expect(claimantNotifications[0].tasks[3]).toEqual(uploadBundlesTask);

        });
      });
    });
  });
});
