// import {t} from 'i18next';
import {Claim} from 'common/models/claim';
import {TaskList} from 'common/models/taskList/taskList';
import {getLng} from 'common/utils/languageToggleUtils';
import {buildSubmitSection, buildYourHearingRequirementsSection} from 'common/utils/taskList/taskListBuilder';
import {CLAIMANT_RESPONSE_CHECK_AND_SEND_URL} from 'routes/urls';
import {calculateTotalAndCompleted} from 'services/features/response/taskListService';
import {buildHowDefendantRespondSection, buildWhatToDoNextSection} from './claimantResponseTasklistBuilder';

export function getClaimantResponseTaskLists (claim: Claim, claimId: string, lng: string) {
  const lang = getLng(lng);

  // TASK BUILDER
  const taskListHowDefendantRespond: TaskList = buildHowDefendantRespondSection(claim, claimId, lang);
  const taskListWhatToDoNext: TaskList = buildWhatToDoNextSection(claim, claimId, lang);
  // TODO : Dq screens needs refactioring
  const taskListYourHearingRequirements: TaskList = buildYourHearingRequirementsSection(claim, claimId, lang);

  const taskGroups = [taskListHowDefendantRespond, taskListWhatToDoNext, taskListYourHearingRequirements];
  const filteredTaskGroups = taskGroups.filter(item => item.tasks.length !== 0);
  // check if all tasks are completed except check and submit
  calculateTotalAndCompleted(taskGroups);
  const taskListSubmitYourResponse: TaskList = buildSubmitSection(claimId, lang, CLAIMANT_RESPONSE_CHECK_AND_SEND_URL);

  filteredTaskGroups.push(taskListSubmitYourResponse);
  return filteredTaskGroups;
}

