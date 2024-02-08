import {CaseState} from 'form/models/claimDetails';
import {ApplyHelpFeesReferenceForm} from 'form/models/caseProgression/hearingFee/applyHelpFeesReferenceForm';
import {YesNo} from 'form/models/yesNo';
import {PaymentStatus} from 'models/PaymentDetails';
import {Claim} from 'models/claim';
import {CaseProgressionHearing} from 'models/caseProgression/caseProgressionHearing';
import {HearingFeeInformation} from 'models/caseProgression/hearingFee/hearingFee';
import {FIXED_DATE} from '../../../../utils/dateUtils';
import {generateNewDashboard, getNotifications} from 'services/dashboard/dashboardService';

import {CaseRole} from 'form/models/caseRoles';

describe('dashboardService', () => {
  let mockClaim;
  let claimWithPaymentStatus;

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
        expect(claimantNotifications.items.length).toEqual(2);

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
        expect(claimantNotifications.items.length).toEqual(2);

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
        expect(claimantNotifications.items.length).toEqual(2);

      });

      it('should show task in progress due to help with fees reference number', () => {
        mockClaim = require('../../../../utils/mocks/civilClaimResponseMock.json');
        claimWithPaymentStatus = {
          ...mockClaim,
          state: CaseState.AWAITING_APPLICANT_INTENTION,
          case_data: {
            ...mockClaim.case_data,
            caseProgression: {
              helpFeeReferenceNumberForm: new ApplyHelpFeesReferenceForm(YesNo.YES, '12341234123'),
            },
            isClaimant: jest.fn().mockReturnValue(true),
            isLRClaimant: jest.fn(),
            isLRDefendant: jest.fn(),
          },
        };
        //when
        const taskList = generateNewDashboard(claimWithPaymentStatus.case_data);

        //Then
        expect(taskList.items).toEqual(2);

      });

      it('should show task done due to successful payment status', () => {

        mockClaim = require('../../../../utils/mocks/civilClaimResponseMock.json');
        claimWithPaymentStatus = {
          ...mockClaim,
          state: CaseState.AWAITING_APPLICANT_INTENTION,
          case_data: {
            ...mockClaim.case_data,
            isClaimant: jest.fn().mockReturnValue(true),
            isLRClaimant: jest.fn(),
            isLRDefendant: jest.fn(),
            caseProgressionHearing: {
              hearingFeePaymentDetails: {
                status: PaymentStatus.SUCCESS,
              },
            },
          },
        };
        //when
        const taskList = generateNewDashboard(claimWithPaymentStatus.case_data);

        //Then
        expect(taskList.items.length).toEqual(2);

      });

      it('should show task done due to successful payment status data available in redis ', () => {

        mockClaim = require('../../../../utils/mocks/civilClaimResponseMock.json');
        claimWithPaymentStatus = {
          ...mockClaim,
          state: CaseState.AWAITING_APPLICANT_INTENTION,
          case_data: {
            ...mockClaim.case_data,
            isClaimant: jest.fn().mockReturnValue(true),
            isLRClaimant: jest.fn(),
            isLRDefendant: jest.fn(),
            caseProgression: {
              hearing: {
                paymentInformation: {
                  status: 'Success',
                },
              },
            },
          },
        };
        //when
        const taskList = generateNewDashboard(claimWithPaymentStatus.case_data);

        //Then
        expect(taskList.items.length).toEqual(2);

      });

      it('should show task not available due to failed payment status', () => {
        mockClaim = require('../../../../utils/mocks/civilClaimResponseMock.json');
        claimWithPaymentStatus = {
          ...mockClaim,
          state: CaseState.AWAITING_APPLICANT_INTENTION,
          case_data: {
            ...mockClaim.case_data,
            isClaimant: jest.fn().mockReturnValue(true),
            isLRClaimant: jest.fn(),
            isLRDefendant: jest.fn(),
            hearingFeePaymentDetails: {
              status: PaymentStatus.FAILED,
            },
            caseProgression: {
              helpFeeReferenceNumberForm: null,
            },
          },
        };
        //when
        const taskList = generateNewDashboard(claimWithPaymentStatus.case_data);

        //Then
        expect(taskList.items.length).toEqual(2);

      });

      it('should show task not available due to missing payment info', () => {
        mockClaim = require('../../../../utils/mocks/civilClaimResponseMock.json');
        claimWithPaymentStatus = {
          ...mockClaim,
          state: CaseState.AWAITING_APPLICANT_INTENTION,
          case_data: {
            ...mockClaim.case_data,
            caseProgression: {
              helpFeeReferenceNumberForm: null,
            },

            isClaimant: jest.fn().mockReturnValue(true),
            isLRClaimant: jest.fn(),
            isLRDefendant: jest.fn(),
          },
        };
        //when
        const taskList = generateNewDashboard(claimWithPaymentStatus.case_data);

        //Then
        expect(taskList.items.length).toEqual(2);

      });
    });
    describe('as Defendant', () => {
      describe('getNotifications', () => {
        it('with no hearing fee + trial arrangements if hearing fee present + fast track type', () => {
          //Given
          const claim = new Claim();
          claim.id = '1234567890';
          claim.caseProgressionHearing = new CaseProgressionHearing(null, null, null, null, null, new HearingFeeInformation({calculatedAmountInPence: '1000', code: 'test', version: '1'}, FIXED_DATE));
          claim.caseRole = CaseRole.DEFENDANT;
          claim.totalClaimAmount = 12345;
          //When
          const claimantNotifications = getNotifications('1234567890',claim,'en');

          //Then
          expect(claimantNotifications).toEqual(2);

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
          expect(claimantNotifications.items.length).toEqual(2);

        });
      });
    });
  });
});
