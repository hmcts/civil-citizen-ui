import {getCaseDataFromStore, saveDraftClaim} from '../../../../modules/draft-store/draftStoreService';
import {CompanyTelephoneNumber} from '../../../../common/form/models/mediation/companyTelephoneNumber';
import {Mediation} from '../../../../common/models/mediation/mediation';
import {YesNo} from '../../../../common/form/models/yesNo';

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
    const contactPerson = claim.respondent1?.contactPerson;
    let telephoneNumberData = new CompanyTelephoneNumber();

    if (claim.mediation?.companyTelephoneNumber) {
      telephoneNumberData = claim.mediation.companyTelephoneNumber;
    } else if (claim.respondent1?.telephoneNumber) {
      telephoneNumberData.mediationPhoneNumberConfirmation = claim.respondent1?.telephoneNumber;
    }
    return [contactPerson, telephoneNumberData];
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const saveCompanyTelephoneNumberData = async (claimId: string, form: CompanyTelephoneNumber) => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    if (!claim.mediation) {
      claim.mediation = new Mediation();
    }
    const updatedForm = filterFormWithSelection(form);
    claim.mediation.companyTelephoneNumber = updatedForm;
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

