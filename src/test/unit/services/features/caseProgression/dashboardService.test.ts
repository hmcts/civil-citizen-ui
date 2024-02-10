import {CaseState} from 'form/models/claimDetails';
import {Claim} from 'models/claim';
import {CaseProgressionHearing} from 'models/caseProgression/caseProgressionHearing';
import {HearingFeeInformation} from 'models/caseProgression/hearingFee/hearingFee';
import {FIXED_DATE} from '../../../../utils/dateUtils';
import {generateNewDashboard, getDashboardForm, getNotifications} from 'services/dashboard/dashboardService';
import {CaseRole} from 'form/models/caseRoles';
import {DashboardNotificationList} from 'models/dashboard/dashboardNotificationList';

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
        const notifications =new DashboardNotificationList();
        //Then
        expect(claimantNotifications).toEqual(notifications);

      });
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
      const notifications =new DashboardNotificationList();
      //Then
      expect(taskList).toEqual(notifications);

    });
  });
  describe('as Defendant', () => {
    describe('getNotifications', () => {
      it('with no hearing fee + trial arrangements if hearing fee present + fast track type', async () => {
        //Given
        const claim = new Claim();
        claim.id = '1234567890';
        claim.caseProgressionHearing = new CaseProgressionHearing(null, null, null, null, null, new HearingFeeInformation({calculatedAmountInPence: '1000', code: 'test', version: '1'}, FIXED_DATE));
        claim.caseRole = CaseRole.DEFENDANT;
        claim.totalClaimAmount = 12345;
        //When
        const claimantNotifications: DashboardNotificationList = await getNotifications('1234567890', claim);
        const notifications = {items :[
          {titleEn:'English Title 1',titleCy:'Welsh Title 1',descriptionEn:'English Description 1',descriptionCy:'Welsh Description 1'},
          {titleEn:'English Title 2',titleCy:'Welsh Title 2',descriptionEn:'English Description 2',descriptionCy:'Welsh Description 2'},
          {titleEn:'English Title 3',titleCy:'Welsh Title 3',descriptionEn:'English Description 3',descriptionCy:'Welsh Description 3'},
        ],
        };
        //Then
        expect(claimantNotifications).toEqual(notifications);

      });

      it('without hearing fee + without trial arrangements if no hearing fee + small claim track type ', async () => {
        //Given
        const claim = new Claim();
        claim.id = '1234567890';
        claim.caseProgressionHearing = new CaseProgressionHearing(null, null, null, null, null, null);
        claim.caseRole = CaseRole.DEFENDANT;
        claim.totalClaimAmount = 900;
        //When
        const claimantDashboard = await getDashboardForm(claim,'1234567890' );
        const dashboard ={items:[
          {title:'Task Title',
            task:[{description:'Description',status:'DONE',helpText:'help'},
              {description:'Description 2',status:'DONE',helpText:'help 2'},
            ],
          }],
        };
        //Then
        expect(claimantDashboard).toEqual(dashboard);

      });
    });
  });
});
