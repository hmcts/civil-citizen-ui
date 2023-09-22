import { SummarySection, SummarySections, summarySection } from 'common/models/summaryList/summarySections';
import {Claim} from 'common/models/claim';
import {StatementOfTruthForm} from 'common/form/models/statementOfTruth/statementOfTruthForm';
import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {ClaimantResponse} from 'common/models/claimantResponse';
import { summaryRow } from 'common/models/summaryList/summaryList';
import { t } from 'i18next';
import { getLng } from 'common/utils/languageToggleUtils';
import { CLAIMANT_RESPONSE_SETTLE_ADMITTED_CLAIM_URL } from 'routes/urls';
import { constructResponseUrlWithIdParams } from 'common/utils/urlFormatter';
import { ClaimResponseStatus } from 'common/models/claimResponseStatus';
import { changeLabel } from 'common/utils/checkYourAnswer/changeButton';
import { RESPONSEFORNOTPAIDPAYIMMEDIATELY } from 'common/models/claimantResponse/checkAnswers';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimantResponseCheckAnswersService');

const buildSummarySections = (claim: Claim, claimId: string, lang: string | unknown): SummarySections => {
  return {
    sections: [
    // TODO : This part will be developed as part of other future tasks for different scenarios
      buildDetailsSection(claim, claimId, lang);
      buildYourResponseSection(claim, claimId, lang);
    ],
  };
};

export const getSummarySections = (claimId: string, claim: Claim, lang?: string | unknown): SummarySections => {
  const lang = getLng(lang);
  return buildSummarySections(claimId, claim, lang);
};

const buildDetailsSection = (claim: Claim, claimId: string, lang: string | unknown): SummarySection => {

  if (claim?.responseStatus === ClaimResponseStatus.PA_NOT_PAID_PAY_IMMEDIATELY) {
    return buildSummarySectionForPartAdmitPayImmediately(claim, claimId, lang);
  }
};

const buildSummarySectionForPartAdmitPayImmediately = (claim: Claim, claimId: string, lang: string | unknown) => {

  const selectedOption = claim?.claimantResponse?.hasPartAdmittedBeenAccepted?.option;
  if (selectedOption) {
    return summarySection({
      title: t('PAGES.CLAIMANT_RESPONSE_TASK_LIST.HEADER', { lang }),
      summaryRows: [
        summaryRow(t('PAGES.CHECK_YOUR_ANSWER.DO_YOU_ACCEPT_OR_REJECT_THE_DEFENDANTS_ADMISSION', { lang }), t(RESPONSEFORNOTPAIDPAYIMMEDIATELY[selectedOption], { lang }), constructResponseUrlWithIdParams(claimId, CLAIMANT_RESPONSE_SETTLE_ADMITTED_CLAIM_URL), changeLabel(lang as string)),
      ],
    });
  }
};

export const saveStatementOfTruth = async (claimId: string, claimantStatementOfTruth: StatementOfTruthForm) => {
  try {
    const claim = await getCaseDataFromStore(claimId);
    if (claim.claimantResponse) {
      claim.claimantResponse.claimantStatementOfTruth = claimantStatementOfTruth;
    } else {
      claim.claimantResponse = new ClaimantResponse();
      claim.claimantResponse.claimantStatementOfTruth = claimantStatementOfTruth;
    }
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
