import {getCaseDataFromStore, saveDraftClaim, generateRedisKey} from 'modules/draft-store/draftStoreService';
import {DirectionQuestionnaire} from 'models/directionsQuestionnaire/directionQuestionnaire';
import {GenericYesNo} from 'form/models/genericYesNo';
import {DirectionQuestionnaireErrorMessages} from 'form/models/directionQuestionnaireErrorMessages';
import {ClaimantResponse} from 'common/models/claimantResponse';
import {ConfirmYourDetailsEvidence} from 'form/models/confirmYourDetailsEvidence';
import {getGenericOptionForm} from 'services/genericForm/genericFormService';
import {AppRequest} from 'models/AppRequest';
import {getResponseClaimById, getResponseDraft, updateResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';
import {getRouteParam} from 'common/utils/routeParamUtils';
import {Claim} from 'models/claim';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('directionQuestionnaireService');

const getDirectionQuestionnaire = async (req: AppRequest): Promise<DirectionQuestionnaire> => {
  try {
    const caseId = getRouteParam(req, 'id');
    const redisKey = generateRedisKey(req);

    let claim = await getCaseDataFromStore(redisKey);

    if (claim.isClaimantIntentionPending()) {
      return claim.claimantResponse?.directionQuestionnaire ? claim.claimantResponse.directionQuestionnaire : new DirectionQuestionnaire();
    }

    claim = await getResponseClaimById(req, caseId);
    return claim?.directionQuestionnaire ? claim.directionQuestionnaire : new DirectionQuestionnaire();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const getGenericOption = async (req: AppRequest, directionQuestionnairePropertyName: string, parentPropertyName?: string): Promise<GenericYesNo> => {
  try {
    const caseId = getRouteParam(req, 'id');
    const redisKey = generateRedisKey(req);

    let claim = await getCaseDataFromStore(redisKey);
    let directionQuestionnaire: any;

    if (claim.isClaimantIntentionPending()) {
      directionQuestionnaire = claim.claimantResponse?.directionQuestionnaire ? claim.claimantResponse.directionQuestionnaire : new DirectionQuestionnaire();
    } else {
      const claim = await getResponseClaimById(req, caseId);
      directionQuestionnaire = claim.directionQuestionnaire ? claim.directionQuestionnaire : new DirectionQuestionnaire();
    }

    if (parentPropertyName && directionQuestionnaire[parentPropertyName] && directionQuestionnaire[parentPropertyName][directionQuestionnairePropertyName]) {
      return directionQuestionnaire[parentPropertyName][directionQuestionnairePropertyName];
    } else if (!parentPropertyName && directionQuestionnaire[directionQuestionnairePropertyName]) {
      return directionQuestionnaire[directionQuestionnairePropertyName];
    } else {
      return getGenericOptionForm(undefined, directionQuestionnairePropertyName, DirectionQuestionnaireErrorMessages);
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

const saveDirectionQuestionnaire = async (req: AppRequest, value: any, directionQuestionnairePropertyName: string, parentPropertyName?: string): Promise<void> => {
  try {
    const caseId = getRouteParam(req, 'id');
    const redisKey = generateRedisKey(req);

    let claim: any = await getCaseDataFromStore(redisKey);
    let draftId: string | undefined;

    if (!claim.isClaimantIntentionPending()) {
      const draftResult = await getResponseDraft(req, caseId);
      if (!draftResult) {
        throw new Error('[directionQuestionnaireService] no response draft found');
      }
      claim = Object.assign(new Claim(), draftResult.claimResponse?.case_data as unknown as Claim);
      draftId = draftResult.rawResponse?.draftId;
      if (draftResult.createdAt && !claim.draftClaimCreatedAt) {
        claim.draftClaimCreatedAt = new Date(draftResult.createdAt);
      }
    }

    if (claim.isClaimantIntentionPending() && !claim.claimantResponse) {
      claim.claimantResponse = new ClaimantResponse();
    }
    const baseProperty = claim.isClaimantIntentionPending() ? claim.claimantResponse : claim;

    if (baseProperty?.directionQuestionnaire) {
      if (parentPropertyName && baseProperty.directionQuestionnaire[parentPropertyName]) {
        baseProperty.directionQuestionnaire[parentPropertyName][directionQuestionnairePropertyName] = value;
      } else if (parentPropertyName && !baseProperty.directionQuestionnaire[parentPropertyName]) {
        baseProperty.directionQuestionnaire[parentPropertyName] = {[directionQuestionnairePropertyName]: value};
      } else {
        baseProperty.directionQuestionnaire[directionQuestionnairePropertyName] = value;
      }
    } else {
      const directionQuestionnaire: any = new DirectionQuestionnaire();
      if (parentPropertyName) {
        directionQuestionnaire[parentPropertyName] = {[directionQuestionnairePropertyName]: value};
      } else {
        directionQuestionnaire[directionQuestionnairePropertyName] = value;
      }
      baseProperty.directionQuestionnaire = directionQuestionnaire;
    }

    if (claim.isClaimantIntentionPending()) {
      await saveDraftClaim(redisKey, claim);
    } else {
      await updateResponseDraft(req, caseId, claim, draftId);
    }
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const getConfirmYourDetailsEvidence = async (req: AppRequest, directionQuestionnairePropertyName: string, parentPropertyName?: string): Promise<ConfirmYourDetailsEvidence> => {
  try {
    const caseId = getRouteParam(req, 'id');
    const redisKey = generateRedisKey(req);

    let claim = await getCaseDataFromStore(redisKey);
    let directionQuestionnaire: any;

    if (claim.isClaimantIntentionPending()) {
      directionQuestionnaire = claim.claimantResponse?.directionQuestionnaire ? claim.claimantResponse.directionQuestionnaire : new DirectionQuestionnaire();
    } else {
      claim = await getResponseClaimById(req, caseId);
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
