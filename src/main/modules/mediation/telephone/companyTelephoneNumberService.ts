import { getCaseDataFromStore, saveDraftClaim } from '../../draft-store/draftStoreService';
import { CompanyTelephoneNumber } from '../../../common/form/models/mediation/telephone/companyTelephoneNumber';
import { Mediation } from '../../../common/models/mediation';

const { Logger } = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('onTaxPaymentsService');

export const getCompanyTelephoneNumberForm = async (claimId: string): Promise<CompanyTelephoneNumber> => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    if (claim.mediation?.companyTelephoneNumber) {
      const companyTelephoneNumber = claim.mediation.companyTelephoneNumber;
      const { option, mediationPhoneNumberConfirmation, mediationContactPerson, mediationPhoneNumber } = companyTelephoneNumber;
      return new CompanyTelephoneNumber(option, mediationPhoneNumber, mediationContactPerson, mediationPhoneNumberConfirmation);
    }
    return new CompanyTelephoneNumber();
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

