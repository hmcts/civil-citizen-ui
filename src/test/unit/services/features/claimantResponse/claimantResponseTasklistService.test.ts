import { Claim } from 'common/models/claim';
import { TaskList } from 'common/models/taskList/taskList';
import { getClaimantResponseTaskLists } from '../../../../../main/services/features/claimantResponse/claimantResponseTasklistService/claimantResponseTasklistService';

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
});
