import {getCaseDataFromStore, saveDraftClaim, generateRedisKey} from '../../../../modules/draft-store/draftStoreService';
import {CompanyTelephoneNumber} from '../../../../common/form/models/mediation/companyTelephoneNumber';
import {Mediation} from '../../../../common/models/mediation/mediation';
import {YesNo} from '../../../../common/form/models/yesNo';
import {ClaimantResponse} from 'common/models/claimantResponse';
import {Claim} from 'models/claim';
import {AppRequest} from 'models/AppRequest';
import {getRouteParam} from 'common/utils/routeParamUtils';
import {getResponseClaimById, updateResponseDraft, getResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('companyTelephoneNumberService');

const filterFormWithSelection = (form: CompanyTelephoneNumber) => {
  if (form.option === YesNo.NO) {
    form.mediationPhoneNumberConfirmation = '';
  } else {
    form.mediationContactPerson = '';
    form.mediationPhoneNumber = '';
  }
  return form;
};

export const getCompanyTelephoneNumberData = async (req: AppRequest): Promise<[string, CompanyTelephoneNumber]> => {
  try {
    const caseId = getRouteParam(req, 'id');
    const redisKey = generateRedisKey(req);
    let claim = await getCaseDataFromStore(redisKey);
    let telephoneNumberData = new CompanyTelephoneNumber();

    if (claim.isClaimantIntentionPending()) {
      const contactPerson = claim.applicant1?.partyDetails?.contactPerson;

      if (claim.claimantResponse?.mediation?.companyTelephoneNumber) {
        telephoneNumberData = claim.claimantResponse?.mediation?.companyTelephoneNumber;
      } else if (claim.applicant1?.partyPhone) {
        telephoneNumberData.mediationPhoneNumberConfirmation = claim.applicant1?.partyPhone?.phone;
      }
      return [contactPerson, telephoneNumberData];
    }

    claim = await getResponseClaimById(req, caseId);
    const contactPerson = claim.respondent1?.partyDetails?.contactPerson;

    if (claim.mediation?.companyTelephoneNumber) {
      telephoneNumberData = claim.mediation.companyTelephoneNumber;
    } else if (claim.respondent1?.partyPhone) {
      telephoneNumberData.mediationPhoneNumberConfirmation = claim.respondent1?.partyPhone?.phone;
    }
    return [contactPerson, telephoneNumberData];

  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const saveCompanyTelephoneNumberData = async (req: AppRequest, form: CompanyTelephoneNumber) => {
  try {
    const caseId = getRouteParam(req, 'id');
    const redisKey = generateRedisKey(req);

    let claim: Claim = await getCaseDataFromStore(redisKey);
    let draftId: string | undefined;

    if (!claim.isClaimantIntentionPending()) {
      const draftResult = await getResponseDraft(req, caseId);
      if (!draftResult) {
        throw new Error('[companyTelephoneNumberService] no response draft found');
      }
      claim = Object.assign(new Claim(), draftResult.claimResponse?.case_data as unknown as Claim);
      draftId = draftResult.rawResponse?.draftId;
      if (draftResult.createdAt && !claim.draftClaimCreatedAt) {
        claim.draftClaimCreatedAt = new Date(draftResult.createdAt);
      }
    }

    const updatedForm = filterFormWithSelection(form);

    if (claim.isClaimantIntentionPending()) {
      if (!claim.claimantResponse) {
        claim.claimantResponse = new ClaimantResponse();
      }
      if (!claim.claimantResponse.mediation) {
        claim.claimantResponse.mediation = new Mediation();
      }
      claim.claimantResponse.mediation.companyTelephoneNumber = updatedForm;
      await saveDraftClaim(redisKey, claim);
    } else {
      if (!claim.mediation) {
        claim.mediation = new Mediation();
      }
      claim.mediation.companyTelephoneNumber = updatedForm;
      await updateResponseDraft(req, caseId, claim, draftId);
    }
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

