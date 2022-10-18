import {DefendantTimeline} from '../../../../common/form/models/timeLineOfEvents/defendantTimeline';
import {Party} from '../../../../common/models/party';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {FormValidationError} from '../../../../common/form/validationErrors/formValidationError';
import {getCaseDataFromStore, saveDraftClaim} from '../../../../modules/draft-store/draftStoreService';

const getTimeline = (party: Party) : DefendantTimeline => {
  return (party?.timeline) ? DefendantTimeline.buildPopulatedForm(party.timeline.rows) : DefendantTimeline.buildEmptyForm();
};

const validateTimeline = (populatedForm: DefendantTimeline) => {
  let form = new GenericForm(populatedForm);
  if (!form.model.atLeastOneRowPopulated()) {
    form = new GenericForm(new DefendantTimeline(populatedForm.rows, undefined, true));
    form.validateSync();
    form.errors.push(new FormValidationError({property: 'atLeastOneFieldRequired', constraints: {text: 'ERRORS.ONE_ROW_REQUIRED'}}));
  } else {
    form.validateSync();
  }
  return form;
};

const saveTimeline = async (claimId: string, timeline: DefendantTimeline) => {
  const claim = await getCaseDataFromStore(claimId);
  if (!claim?.applicant1) {
    claim.applicant1 = new Party();
  }
  timeline.filterOutEmptyRows();
  claim.applicant1.timeline = timeline;
  await saveDraftClaim(claimId, claim);
};

export {
  getTimeline,
  saveTimeline,
  validateTimeline,
};
