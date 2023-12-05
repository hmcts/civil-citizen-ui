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
import {ClaimResponseStatus} from 'models/claimResponseStatus';

export function getClaimantResponseTaskLists (claim: Claim, claimId: string, lng: string) {
  const lang = getLng(lng);
  const taskGroups : TaskList[] = [];
  taskGroups.push(buildHowDefendantRespondSection(claim, claimId, lang));
  if(canShowWhatToDoNextSection(claim)) {
    taskGroups.push(buildWhatToDoNextSection(claim, claimId, lang));
  }
  if(canShowYourResponseSection(claim)) {
    taskGroups.push(buildYourResponseSection(claim, claimId, lang));
  }
  taskGroups.push(buildClaimantHearingRequirementsSection(claim, claimId, lang));
  taskGroups.push(buildClaimantResponseSubmitSection(claimId, lang));
  return taskGroups.filter(item => item.tasks.length !== 0);
}

function canShowWhatToDoNextSection(claim: Claim) : boolean {
  return (
    claim.isPartialAdmissionNotPaid()
    || isFullDefenceWithDisputeOrFullPaid(claim)
    || claim.isFullAdmission()
  );
}

function canShowYourResponseSection(claim: Claim) : boolean {
  return (
    claim.isPartialAdmissionPaid()
    || isFullDefenceWithPaidLess(claim)
  );
}

function isFullDefenceWithDisputeOrFullPaid(claim: Claim) : boolean {
  return (claim.isFullDefence()
    && (claim.isRejectAllOfClaimDispute()
      || claim.responseStatus === ClaimResponseStatus.RC_PAID_FULL));
}

function isFullDefenceWithPaidLess(claim: Claim) : boolean {
  return (claim.isFullDefence()
    && !claim.isRejectAllOfClaimDispute()
    && claim.responseStatus === ClaimResponseStatus.RC_PAID_LESS);
}
