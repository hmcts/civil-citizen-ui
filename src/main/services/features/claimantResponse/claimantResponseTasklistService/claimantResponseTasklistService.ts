import {Claim} from 'common/models/claim';
import {TaskList} from 'common/models/taskList/taskList';
import {getLng} from 'common/utils/languageToggleUtils';
import {
  buildClaimantHearingRequirementsSection,
  buildClaimantResponseSubmitSection,
  buildHowDefendantRespondSection,
  buildWhatToDoNextSection,
  buildYourResponseSection,
} from './claimantResponseTasklistBuilder';

export function getClaimantResponseTaskLists (claim: Claim, claimId: string, lng: string) {
  const lang = getLng(lng);
  const taskListHowDefendantRespond: TaskList = buildHowDefendantRespondSection(claim, claimId, lang);
  const taskListWhatToDoNext: TaskList = buildWhatToDoNextSection(claim, claimId, lang);
  const taskListYourResponse: TaskList = buildYourResponseSection(claim, claimId, lang);
  const taskListClaimantHearingRequirements: TaskList = buildClaimantHearingRequirementsSection(claim, claimId, lang);
  const taskListSubmitClaimantResponse: TaskList = buildClaimantResponseSubmitSection(claimId, lang);
  const taskGroups = [taskListHowDefendantRespond, taskListWhatToDoNext, taskListYourResponse, taskListClaimantHearingRequirements, taskListSubmitClaimantResponse];
  return taskGroups.filter(item => item.tasks.length !== 0);
}
