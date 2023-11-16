import {Claim} from 'common/models/claim';
import {TaskList} from 'common/models/taskList/taskList';
import {getClaimantResponseTaskLists} from '../../../../../main/services/features/claimantResponse/claimantResponseTasklistService/claimantResponseTasklistService';
import {ClaimResponseStatus} from 'models/claimResponseStatus';

describe('getClaimantResponseTaskLists', () => {
  let claim: Claim;
  const claimId = '123';
  const lng = 'en';

  beforeEach(() => {
    claim = new Claim();
  });
  it('should return an array of TaskLists with expected task groups for partial admission', () => {
    // given
    claim.isPartialAdmission = () => true;
    claim.isFullAdmission = () => false;

    // when
    const taskLists: TaskList[] = getClaimantResponseTaskLists(
      claim,
      claimId,
      lng,
    );

    // then
    expect(taskLists.length).toBeGreaterThan(0);

    // task groups that are included
    expect(taskLists.some((list) => list.title = 'How they responded')).toBe(true);
    expect(taskLists.some((list) => list.title = 'Choose what to do next')).toBe(true);
    expect(taskLists.some((list) => list.title = 'Submit')).toBe(true);

    // task groups are not included
    expect(taskLists.some((list) => list.title === 'Your Response')).toBe(false);
  });

  it('should return an array of TaskLists with expected task groups for full admission', () => {
    // given
    claim.isPartialAdmission = () => false;
    claim.isFullAdmission = () => true;

    // when
    const taskLists: TaskList[] = getClaimantResponseTaskLists(
      claim,
      claimId,
      lng,
    );

    // then
    expect(taskLists.length).toBeGreaterThan(0);

    // task groups that are included
    expect(taskLists.some((list) => list.title = 'How they responded')).toBe(true);
    expect(taskLists.some((list) => list.title = 'Choose what to do next')).toBe(true);
    expect(taskLists.some((list) => list.title = 'Submit')).toBe(true);

    // task groups are not included
    expect(taskLists.some((list) => list.title === 'What to Do Next')).toBe(false);
  });

  it('should return an array of TaskLists with expected task groups for full defence and paid full', () => {
    // given
    const claim = {
      isFullDefence: jest.fn(),
      isClaimantIntentionPending: jest.fn(),
      isPartialAdmissionNotPaid: jest.fn(),
      isPartialAdmissionPaid: jest.fn(),
      isRejectAllOfClaimDispute: jest.fn(),
      isPartialAdmission: jest.fn(),
      isFullAdmission: jest.fn(),
      hasConfirmedAlreadyPaid: jest.fn(),
      hasPaidInFull: jest.fn(),
      hasClaimantRejectedDefendantPaid: jest.fn(),
      responseStatus: ClaimResponseStatus.RC_PAID_FULL,
    } as any;
    claim.isFullDefence.mockReturnValue(true);
    claim.isClaimantIntentionPending.mockReturnValue(true);
    claim.isPartialAdmissionNotPaid.mockReturnValue(false);
    claim.isPartialAdmissionPaid.mockReturnValue(false);
    claim.isRejectAllOfClaimDispute.mockReturnValue(false);
    claim.isPartialAdmission.mockReturnValue(false);
    claim.hasConfirmedAlreadyPaid.mockReturnValue(true);
    claim.hasPaidInFull.mockReturnValue(true);
    claim.hasClaimantRejectedDefendantPaid.mockReturnValue(true);
    claim.isFullAdmission.mockReturnValue(false);

    // when
    const taskLists: TaskList[] = getClaimantResponseTaskLists(
      claim,
      claimId,
      lng,
    );

    // then
    expect(taskLists.length).toBeGreaterThan(0);

    // task groups that are included
    expect(taskLists.some((list) => list.title = 'How they responded')).toBe(true);
    expect(taskLists.some((list) => list.title = 'Choose what to do next')).toBe(true);
    expect(taskLists.some((list) => list.title = 'Submit')).toBe(true);

    // task groups are not included
    expect(taskLists.some((list) => list.title === 'Your Response')).toBe(false);
  });

  it('should return an array of TaskLists with expected task groups for full defence and paid less', () => {
    // given
    const claim = {
      isFullDefence: jest.fn(),
      isClaimantIntentionPending: jest.fn(),
      isPartialAdmissionNotPaid: jest.fn(),
      isPartialAdmissionPaid: jest.fn(),
      isRejectAllOfClaimDispute: jest.fn(),
      isPartialAdmission: jest.fn(),
      isFullAdmission: jest.fn(),
      hasConfirmedAlreadyPaid: jest.fn(),
      hasPaidInFull: jest.fn(),
      hasClaimantRejectedDefendantPaid: jest.fn(),
      isRejectAllOfClaimAlreadyPaid: jest.fn(),
      hasClaimantConfirmedDefendantPaid: jest.fn(),
      responseStatus: ClaimResponseStatus.RC_PAID_LESS,
    } as any;
    claim.isFullDefence.mockReturnValue(true);
    claim.isClaimantIntentionPending.mockReturnValue(true);
    claim.isPartialAdmissionNotPaid.mockReturnValue(false);
    claim.isPartialAdmissionPaid.mockReturnValue(false);
    claim.isRejectAllOfClaimDispute.mockReturnValue(false);
    claim.isPartialAdmission.mockReturnValue(false);
    claim.hasConfirmedAlreadyPaid.mockReturnValue(true);
    claim.hasPaidInFull.mockReturnValue(true);
    claim.hasClaimantRejectedDefendantPaid.mockReturnValue(true);
    claim.isRejectAllOfClaimAlreadyPaid.mockReturnValue(true);
    claim.hasClaimantConfirmedDefendantPaid.mockReturnValue(false);
    claim.isFullAdmission.mockReturnValue(false);

    // when
    const taskLists: TaskList[] = getClaimantResponseTaskLists(
      claim,
      claimId,
      lng,
    );

    // then
    expect(taskLists.length).toBeGreaterThan(0);

    // task groups that are included
    expect(taskLists.some((list) => list.title = 'Your Response')).toBe(true);

    // task groups are not included
    expect(taskLists.some((list) => list.title === 'How they responded')).toBe(false);
  });
});
