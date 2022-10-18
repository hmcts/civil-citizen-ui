import {Timeline} from '../../../../common/form/models/timeLineOfEvents/timeline';
import {Party} from '../../../../common/models/party';
import {GenericForm} from '../../../../common/form/models/genericForm';
import {FormValidationError} from '../../../../common/form/validationErrors/formValidationError';
import {getCaseDataFromStore, saveDraftClaim} from '../../../../modules/draft-store/draftStoreService';

const getTimeline = (party: Party) : Timeline => {
  return (party?.timeline) ? Timeline.buildPopulatedForm(party.timeline.rows) : Timeline.buildEmptyForm();
};

const validateTimeline = (populatedForm: Timeline) => {
  let form = new GenericForm(populatedForm);
  if (!form.model.atLeastOneRowPopulated()) {
    form = new GenericForm(new Timeline(populatedForm.rows, undefined, true));
    form.validateSync();
    form.errors.push(new FormValidationError({property: 'atLeastOneFieldRequired', constraints: {text: 'ERRORS.ONE_ROW_REQUIRED'}}));
  } else {
    form.validateSync();
  }
  return form;
};

const saveTimeline = async (claimId: string, timeline: Timeline) => {
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
