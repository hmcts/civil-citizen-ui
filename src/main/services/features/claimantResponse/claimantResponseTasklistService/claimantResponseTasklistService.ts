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

  // TASK BUILDER
  const taskListHowDefendantRespond: TaskList = buildHowDefendantRespondSection(claim, claimId, lang);
  const taskListWhatToDoNext: TaskList = buildWhatToDoNextSection(claim, claimId, lang);
  // TODO : Dq screens needs refactioring
  const taskListYourHearingRequirements: TaskList = buildClaimantHearingRequirementsSection(claim, claimId, lang);

  const taskGroups = [taskListHowDefendantRespond, taskListWhatToDoNext, taskListYourHearingRequirements];
  const filteredTaskGroups = taskGroups.filter(item => item.tasks.length !== 0);
  // check if all tasks are completed except check and submit
  calculateTotalAndCompleted(taskGroups);
  const taskListSubmitYourResponse: TaskList = buildClaimantResponseSubmitSection(claimId, lang);

  filteredTaskGroups.push(taskListSubmitYourResponse);
  return filteredTaskGroups;
}
