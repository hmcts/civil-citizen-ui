import {Claim} from 'common/models/claim';
import {TaskList} from 'common/models/taskList/taskList';
import {getLng} from 'common/utils/languageToggleUtils';
import {calculateTotalAndCompleted} from 'services/features/response/taskListService';
import {
  buildClaimantHearingRequirementsSection,
  buildClaimantResponseSubmitSection,
  buildHowDefendantRespondSection,
  buildWhatToDoNextSection,
} from './claimantResponseTasklistBuilder';

export function getClaimantResponseTaskLists (claim: Claim, claimId: string, lng: string) {
  const lang = getLng(lng);

  const taskListHowDefendantRespond: TaskList = buildHowDefendantRespondSection(claim, claimId, lang);
  const taskListWhatToDoNext: TaskList = buildWhatToDoNextSection(claim, claimId, lang);
  const taskListClaimantHearingRequirements: TaskList = buildClaimantHearingRequirementsSection(claim, claimId, lang);

  const taskGroups = [taskListHowDefendantRespond, taskListWhatToDoNext, taskListClaimantHearingRequirements];
  const filteredTaskGroups = taskGroups.filter(item => item.tasks.length !== 0);
  // check if all tasks are completed except check and submit
  calculateTotalAndCompleted(taskGroups);
  const taskListSubmitClaimantResponse: TaskList = buildClaimantResponseSubmitSection(claim, claimId, lang);

  filteredTaskGroups.push(taskListSubmitClaimantResponse);
  return filteredTaskGroups;
}
