import {CaseState} from 'form/models/claimDetails';
import {generateNewDashboard} from 'services/features/caseProgression/dashboardService';
import {PaymentStatus} from 'models/PaymentDetails';
import {TaskStatus} from 'models/taskList/TaskStatus';

describe('Dashboard Service', () => {
  let mockClaim;
  let claimWithPaymentStatus;

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
    expect(taskList.length).toEqual(2);
    expect(taskList[0].tasks[3].description).toEqual('PAGES.DASHBOARD.HEARINGS.PAY_FEE');
    expect(taskList[0].tasks[3].status).toEqual(TaskStatus.DONE);
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
    expect(taskList.length).toEqual(2);
    expect(taskList[0].tasks[3].description).toEqual('PAGES.DASHBOARD.HEARINGS.PAY_FEE');
    expect(taskList[0].tasks[3].status).toEqual(TaskStatus.DONE);
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
      },
    };
    //when
    const taskList = generateNewDashboard(claimWithPaymentStatus.case_data);

    //Then
    expect(taskList.length).toEqual(2);
    expect(taskList[0].tasks[3].description).toEqual('PAGES.DASHBOARD.HEARINGS.PAY_FEE');
    expect(taskList[0].tasks[3].status).toEqual(TaskStatus.NOT_AVAILABLE_YET);
  });

  it('should show task not available  due to missing payment info', () => {
    mockClaim = require('../../../../utils/mocks/civilClaimResponseMock.json');
    claimWithPaymentStatus = {
      ...mockClaim,
      state: CaseState.AWAITING_APPLICANT_INTENTION,
      case_data: {
        ...mockClaim.case_data,
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
