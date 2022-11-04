import {getCaseDataFromStore, saveDraftClaim} from '../../../../../../modules/draft-store/draftStoreService';
import {
  OnTaxPayments,
} from '../../../../../../common/form/models/statementOfMeans/employment/selfEmployed/onTaxPayments';
import {convertFromYesNo, convertToYesNo} from '../../../../../../common/utils/yesNoOptionConverter';
import {Claim} from '../../../../../../common/models/claim';
import {StatementOfMeans} from '../../../../../../common/models/statementOfMeans';
import {GenericForm} from '../../../../../../common/form/models/genericForm';
import {YesNo} from '../../../../../../common/form/models/yesNo';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('onTaxPaymentsService');

const getOnTaxPaymentsForm = async (claimId: string): Promise<GenericForm<OnTaxPayments>> => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    if (claim?.statementOfMeans?.taxPayments) {
      const taxPayments = claim.statementOfMeans.taxPayments;
      return new GenericForm(new OnTaxPayments(convertToYesNo(taxPayments.owed), taxPayments.amountOwed, taxPayments.reason));
    }
    return new GenericForm(new OnTaxPayments());
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const saveTaxPaymentsData = async (claimId: string, form: GenericForm<OnTaxPayments>) => {
  try {
    const claim = await getClaim(claimId);
    claim.statementOfMeans.taxPayments = {
      owed: convertFromYesNo(form.model.option),
      amountOwed: form.model.amountYouOwe,
      reason: form.model.reason,
    };
    if (form.model.option === YesNo.NO) {
      logger.info('Removing the amountOwed and reason values');
      claim.statementOfMeans.taxPayments.amountOwed = undefined;
      claim.statementOfMeans.taxPayments.reason = undefined;
    }
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

const getClaim = async (claimId: string): Promise<Claim> => {
  const claim = await getCaseDataFromStore(claimId);
  if (!claim.statementOfMeans) {
    claim.statementOfMeans = new StatementOfMeans();
  }
  return claim;
};

export {
  getOnTaxPaymentsForm,
  saveTaxPaymentsData,
};
