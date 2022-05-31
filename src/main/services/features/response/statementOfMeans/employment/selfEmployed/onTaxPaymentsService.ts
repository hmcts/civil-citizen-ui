import {getCaseDataFromStore, saveDraftClaim} from '../../../../../../modules/draft-store/draftStoreService';
import {
  OnTaxPayments,
} from '../../../../../../common/form/models/statementOfMeans/employment/selfEmployed/onTaxPayments';
import {convertFromYesNo, convertToYesNo} from '../../../../../../common/utils/yesNoOptionConverter';
import {Claim} from '../../../../../../common/models/claim';
import {StatementOfMeans} from '../../../../../../common/models/statementOfMeans';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('onTaxPaymentsService');

const getOnTaxPaymentsForm = async (claimId: string): Promise<OnTaxPayments> => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    if (claim?.statementOfMeans?.taxPayments) {
      const taxPayments = claim.statementOfMeans.taxPayments;
      return new OnTaxPayments(convertToYesNo(taxPayments.owed), taxPayments.amountOwed, taxPayments.reason);
    }
    return new OnTaxPayments();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const saveTaxPaymentsData = async (claimId: string, form: OnTaxPayments) => {
  try {
    const claim = await getClaim(claimId);
    claim.statementOfMeans.taxPayments = {
      owed: convertFromYesNo(form.option),
      amountOwed: form.amountYouOwe,
      reason: form.reason,
    };
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const getClaim = async (claimId: string): Promise<Claim> => {
  const claim = await getCaseDataFromStore(claimId) || new Claim();
  if (!claim.statementOfMeans) {
    claim.statementOfMeans = new StatementOfMeans();
  }
  return claim;
};

export {
  getOnTaxPaymentsForm,
  saveTaxPaymentsData,
};
