import { getCaseDataFromStore, saveDraftClaim } from '../../draft-store/draftStoreService';
import { CompanyTelephoneNumber } from '../../../common/form/models/mediation/telephone/companyTelephoneNumber';
import { Mediation } from '../../../common/models/mediation';

const { Logger } = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('onTaxPaymentsService');

export const getCompanyTelephoneNumberData = async (claimId: string):Promise<[string, CompanyTelephoneNumber]> => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    const contactPerson = claim.respondent1?.organisationName;
    let telephoneNumberData = new CompanyTelephoneNumber();
    if (claim.mediation?.companyTelephoneNumber) {
      telephoneNumberData = claim.mediation.companyTelephoneNumber;
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
    claim.mediation.companyTelephoneNumber = form;
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

