import {CaseState} from 'form/models/claimDetails';
import {generateNewDashboard} from 'services/features/caseProgression/dashboardService';
import {TaskStatus} from 'models/taskList/TaskStatus';
import {ApplyHelpFeesReferenceForm} from 'form/models/caseProgression/hearingFee/applyHelpFeesReferenceForm';
import {YesNo} from 'form/models/yesNo';

describe('Dashboard Service', () => {
  let mockClaim;
  let claimWithPaymentStatus;

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
    expect(taskList.length).toEqual(2);
    expect(taskList[0].tasks[3].description).toEqual('PAGES.DASHBOARD.HEARINGS.PAY_FEE');
    expect(taskList[0].tasks[3].status).toEqual(TaskStatus.IN_PROGRESS);
  });

  it('should show task not available due to lack of Help With Fees reference number', () => {

    mockClaim = require('../../../../utils/mocks/civilClaimResponseMock.json');
    claimWithPaymentStatus = {
      ...mockClaim,
      state: CaseState.AWAITING_APPLICANT_INTENTION,
      case_data: {
        ...mockClaim.case_data,
        caseProgression: {
          helpFeeReferenceNumberForm: new ApplyHelpFeesReferenceForm(YesNo.NO),
        },
        isClaimant: jest.fn().mockReturnValue(true),
        isLRClaimant: jest.fn(),
        isLRDefendant: jest.fn(),
      },
    };
    //when
    const taskList = generateNewDashboard(claimWithPaymentStatus.case_data);

    //Then
    expect(taskList.length).toEqual(2);
    expect(taskList[0].tasks[3].description).toEqual('PAGES.DASHBOARD.HEARINGS.PAY_FEE');
    expect(taskList[0].tasks[3].status).toEqual(TaskStatus.NOT_AVAILABLE_YET);
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
    expect(taskList.length).toEqual(2);
    expect(taskList[0].tasks[3].description).toEqual('PAGES.DASHBOARD.HEARINGS.PAY_FEE');
    expect(taskList[0].tasks[3].status).toEqual(TaskStatus.NOT_AVAILABLE_YET);
  });

});
