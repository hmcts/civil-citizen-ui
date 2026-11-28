import {getResponseDraft, getResponseClaimById, updateResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';
import {OnTaxPayments} from 'common/form/models/statementOfMeans/employment/selfEmployed/onTaxPayments';
import {convertFromYesNo, convertToYesNo} from 'common/utils/yesNoOptionConverter';
import {Claim} from 'common/models/claim';
import {StatementOfMeans} from 'common/models/statementOfMeans';
import {GenericForm} from 'common/form/models/genericForm';
import {YesNo} from 'common/form/models/yesNo';
import {AppRequest} from 'models/AppRequest';
import {getRouteParam} from 'common/utils/routeParamUtils';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('onTaxPaymentsService');

const getOnTaxPaymentsForm = async (req: AppRequest): Promise<GenericForm<OnTaxPayments>> => {
  try {
    const caseId = getRouteParam(req, 'id');
    const claim = await getResponseClaimById(req, caseId);

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

const saveTaxPaymentsData = async (req: AppRequest, form: GenericForm<OnTaxPayments>) => {
  try {
    const caseId = getRouteParam(req, 'id');
    const draftResult = await getResponseDraft(req, caseId);
    if (!draftResult) {
      throw new Error('[onTaxPaymentsService] no response draft found');
    }
    const claim = Object.assign(new Claim(), draftResult.claimResponse?.case_data as unknown as Claim);
    const draftId = draftResult.rawResponse?.draftId;
    if (!claim.statementOfMeans) {
      claim.statementOfMeans = new StatementOfMeans();
    }

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
    if (draftResult.createdAt && !claim.draftClaimCreatedAt) {
      claim.draftClaimCreatedAt = new Date(draftResult.createdAt);
    }
    await updateResponseDraft(req, caseId, claim, draftId);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export {
  getOnTaxPaymentsForm,
  saveTaxPaymentsData,
};
