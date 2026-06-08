import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {DirectionQuestionnaire} from 'models/directionsQuestionnaire/directionQuestionnaire';
import {GenericYesNo} from 'form/models/genericYesNo';
import {DirectionQuestionnaireErrorMessages} from 'form/models/directionQuestionnaireErrorMessages';
import {ClaimantResponse} from 'common/models/claimantResponse';
import {ConfirmYourDetailsEvidence} from 'form/models/confirmYourDetailsEvidence';
import {getGenericOptionForm} from 'services/genericForm/genericFormService';
import {Claim} from 'models/claim';
const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('directionQuestionnaireService');

const getDirectionQuestionnaire = async (claimId: string): Promise<DirectionQuestionnaire> => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    if (claim.isClaimantIntentionPending()) {
      return claim.claimantResponse?.directionQuestionnaire ? claim.claimantResponse.directionQuestionnaire : new DirectionQuestionnaire();
    }
    return (claim?.directionQuestionnaire) ? claim.directionQuestionnaire : new DirectionQuestionnaire();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const getGenericOption = async (claimId: string, directionQuestionnairePropertyName: string, parentPropertyName?: string): Promise<GenericYesNo> => {
  try {
    const caseData = await getCaseDataFromStore(claimId);
    let directionQuestionnaire: any = caseData?.directionQuestionnaire ? caseData.directionQuestionnaire : new DirectionQuestionnaire();
    if (caseData.isClaimantIntentionPending()) {
      directionQuestionnaire = caseData?.claimantResponse?.directionQuestionnaire ? caseData.claimantResponse.directionQuestionnaire : new DirectionQuestionnaire();
    }
    if (parentPropertyName && directionQuestionnaire[parentPropertyName] && directionQuestionnaire[parentPropertyName][directionQuestionnairePropertyName]) {
      return directionQuestionnaire[parentPropertyName][directionQuestionnairePropertyName];
    } else if (!parentPropertyName && directionQuestionnaire[directionQuestionnairePropertyName]) {
      return directionQuestionnaire[directionQuestionnairePropertyName];
    } else {
      return getGenericOptionForm(undefined,directionQuestionnairePropertyName,DirectionQuestionnaireErrorMessages);
    }
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const getGenericOptionFormDirectionQuestionnaire = (option: string, propertyName: string): GenericYesNo => {
  return getGenericOptionForm(option,propertyName,DirectionQuestionnaireErrorMessages);
};

const getConfirmYourDetailsEvidenceForm = (body: any): ConfirmYourDetailsEvidence => {
  return new ConfirmYourDetailsEvidence(body.firstName,
    body.lastName,
    body.emailAddress,
    body.phoneNumber,
    body.jobTitle);
};

const getDQBaseProperty = (claim: Claim): Claim | ClaimantResponse => {
  if (claim.isClaimantIntentionPending()) {
    claim.claimantResponse ??= new ClaimantResponse();
    return claim.claimantResponse;
  }
  return claim;
};

const setDirectionQuestionnaireValue = (
  directionQuestionnaire: DirectionQuestionnaire,
  value: any,
  propertyName: string,
  parentPropertyName?: string,
): void => {
  const editableDirectionQuestionnaire = directionQuestionnaire as Record<string, any>;
  if (parentPropertyName) {
    editableDirectionQuestionnaire[parentPropertyName] ??= {};
    editableDirectionQuestionnaire[parentPropertyName][propertyName] = value;
    return;
  }
  editableDirectionQuestionnaire[propertyName] = value;
};

const saveDirectionQuestionnaire = async (claimId: string, value: any, directionQuestionnairePropertyName: string, parentPropertyName?: string): Promise<void> => {
  try {
    const claim: Claim = await getCaseDataFromStore(claimId);
    const baseProperty : Claim | ClaimantResponse = getDQBaseProperty(claim);
    baseProperty.directionQuestionnaire ??= new DirectionQuestionnaire();
    setDirectionQuestionnaireValue(
      baseProperty.directionQuestionnaire,
      value,
      directionQuestionnairePropertyName,
      parentPropertyName,
    );
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const getConfirmYourDetailsEvidence = async (claimId: string, directionQuestionnairePropertyName: string, parentPropertyName?: string): Promise<ConfirmYourDetailsEvidence> => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    let directionQuestionnaire: any;
    if (claim.isClaimantIntentionPending()) {
      directionQuestionnaire = claim.claimantResponse?.directionQuestionnaire ? claim.claimantResponse.directionQuestionnaire : new DirectionQuestionnaire();
    } else {
      directionQuestionnaire = claim?.directionQuestionnaire ? claim.directionQuestionnaire : new DirectionQuestionnaire();
    }
    if (parentPropertyName && directionQuestionnaire[parentPropertyName] && directionQuestionnaire[parentPropertyName][directionQuestionnairePropertyName]) {
      return directionQuestionnaire[parentPropertyName][directionQuestionnairePropertyName];
    } else if (!parentPropertyName && directionQuestionnaire[directionQuestionnairePropertyName]) {
      return directionQuestionnaire[directionQuestionnairePropertyName];
    } else {
      return new ConfirmYourDetailsEvidence();
    }
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export {
  getDirectionQuestionnaire,
  saveDirectionQuestionnaire,
  getGenericOption,
  getGenericOptionFormDirectionQuestionnaire,
  getConfirmYourDetailsEvidence,
  getConfirmYourDetailsEvidenceForm,
};
