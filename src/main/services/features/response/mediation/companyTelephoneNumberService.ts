import {getCaseDataFromStore, saveDraftClaim} from '../../../../modules/draft-store/draftStoreService';
import {CompanyTelephoneNumber} from '../../../../common/form/models/mediation/companyTelephoneNumber';
import {Mediation} from '../../../../common/models/mediation/mediation';
import {YesNo} from '../../../../common/form/models/yesNo';
import { ClaimantResponse } from 'common/models/claimantResponse';

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

export const getCompanyTelephoneNumberData = async (claimId: string): Promise<[string, CompanyTelephoneNumber]> => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    let telephoneNumberData = new CompanyTelephoneNumber();

    const contactPerson = claim.isClaimantIntentionPending() 
      ? claim.applicant1?.partyDetails?.contactPerson
      : claim.respondent1?.partyDetails.contactPerson;

    if (claim.isClaimantIntentionPending()) {
  
      if (claim.claimantResponse?.mediation?.companyTelephoneNumber) {
        telephoneNumberData = claim.claimantResponse?.mediation?.companyTelephoneNumber;
      } else if (claim.applicant1?.partyPhone) {
        telephoneNumberData.mediationPhoneNumberConfirmation = claim.applicant1?.partyPhone?.phone;
      }
      return [contactPerson, telephoneNumberData];
    } else {
  
      if (claim.mediation?.companyTelephoneNumber) {
        telephoneNumberData = claim.mediation.companyTelephoneNumber;
      } else if (claim.respondent1?.partyPhone) {
        telephoneNumberData.mediationPhoneNumberConfirmation = claim.respondent1?.partyPhone?.phone;
      }
      return [contactPerson, telephoneNumberData];
    }
   
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const saveCompanyTelephoneNumberData = async (claimId: string, form: CompanyTelephoneNumber) => {
  try {
    const claim = await getCaseDataFromStore(claimId);

    if (claim.isClaimantIntentionPending()) {
      if (!claim.claimantResponse) {
        claim.claimantResponse = new ClaimantResponse();
      }
      if (!claim.claimantResponse?.mediation) {
        claim.claimantResponse.mediation = new Mediation();
      }
      const updatedForm = filterFormWithSelection(form);
      claim.claimantResponse.mediation.companyTelephoneNumber = updatedForm;
    } else {
      if (!claim.mediation) {
        claim.mediation = new Mediation();
      }
      const updatedForm = filterFormWithSelection(form);
      claim.mediation.companyTelephoneNumber = updatedForm;
    }
    
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

