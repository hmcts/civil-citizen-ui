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
import {isFullDefenceAndNotCounterClaim} from 'common/utils/taskList/tasks/taskListHelpers';
import {buildHearingRequirementsSectionCommon} from 'services/features/common/buildHearingRequirementsSection';
import { buildFreeTelephoneMediationSection } from './buildFreeTelephoneMediationSection';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimantResponseCheckAnswersService');

const buildSummarySections = (claim: Claim, claimId: string, lang: string | unknown): SummarySections => {
  const lng = getLng(lang);
  const getFreeTelephoneMediationSection = () => {
    return claim.isFullDefence()
      || claim.isPartialAdmission()
      ? buildFreeTelephoneMediationSection(claim, claimId, lang)
      : null;
  };
  const getHearingRequirementsSection = () => {
    return (claim.isPartialAdmission() || isFullDefenceAndNotCounterClaim(claim))
      ? buildHearingRequirementsSectionCommon(claim, claimId, lang, claim.claimantResponse.directionQuestionnaire)
      : null;
  };
  return {
    sections: [
      buildDetailsSection(claim, claimId, lng),
      getFreeTelephoneMediationSection(),
      getHearingRequirementsSection(),
    ],
  };
};

export const getSummarySections = (claimId: string, claim: Claim, lang?: string | unknown): SummarySections => {
  return buildSummarySections(claim, claimId, lang);
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
