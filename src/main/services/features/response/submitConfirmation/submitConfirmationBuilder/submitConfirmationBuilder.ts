import {Claim} from 'models/claim';
import {ClaimSummarySection} from 'form/models/claimSummarySection';
import {
  getContactYouStatement, getFAPayByDateNextSteps,
  getFAPayByDateStatus, getFAPayByInstallmentsNextSteps,
  getFAPayByInstallmentsStatus, getFAPayImmediatelyNextSteps,
  getFAPAyImmediatelyStatus,
  getfinancialDetails,
} from './admissionSubmitConfirmationContent';

import {
  getRC_PaidLessStatus,
  getRC_PaidFullStatus,
  getRC_PaidLessNextSteps,
  getRC_PaidFullNextSteps,
} from './rejectClaimConfirmationContent';

import {ClaimResponseStatus} from 'models/claimResponseStatus';
import {getRCDisputeNextSteps, getRCDisputeStatus} from './fullDefenceConfirmationContent';
import {
  getPA_AlreadyPaidStatus,
  getPA_AlreadyPaidNextSteps,
  getPAPayByDateNextSteps,
  getPAPayByDateStatus,
  getPAPayImmediatelyNextSteps,
  getPAPayImmediatelyStatus,
  getPAPayInstallmentsNextSteps,
  getPAPayInstallmentsStatus,
} from './partAdmissionConfirmationContent';

export function buildSubmitStatus(claimId: string, claim: Claim, lang: string): ClaimSummarySection[] {
  const FAPAyImmediatelyStatus = getFAPAyImmediatelyStatus(claim, lang);
  const FAPayByDateStatus = getFAPayByDateStatus(claim, lang);
  const FAPayByInstallmentsStatus = getFAPayByInstallmentsStatus(claim, lang);
  const contactYouStatement = getContactYouStatement(lang);
  const financialDetails = getfinancialDetails(claimId, claim, lang);
  const PA_AlreadyPaidStatus = getPA_AlreadyPaidStatus(claim, lang);
  const RCDisputeStatus = getRCDisputeStatus(claim,lang);
  const PAPayImmediatelyStatus = getPAPayImmediatelyStatus(claim, lang);
  const PAPayByDateStatus = getPAPayByDateStatus(claim, lang);
  const PAPayInstallmentsStatus = getPAPayInstallmentsStatus(claim, lang);
  const RC_PaidLessStatus = getRC_PaidLessStatus(claim, lang);
  const RC_PaidFullStatus = getRC_PaidFullStatus(claim, lang);

  switch (claim.responseStatus) {
    case ClaimResponseStatus.FA_PAY_IMMEDIATELY:
      return FAPAyImmediatelyStatus;
    case ClaimResponseStatus.FA_PAY_BY_DATE:
      return [...FAPayByDateStatus, ...contactYouStatement, ...financialDetails];
    case ClaimResponseStatus.FA_PAY_INSTALLMENTS:
      return [...FAPayByInstallmentsStatus, ...contactYouStatement, ...financialDetails];
    case ClaimResponseStatus.RC_DISPUTE:
      return RCDisputeStatus;
    case ClaimResponseStatus.PA_ALREADY_PAID:
      return PA_AlreadyPaidStatus;
    case ClaimResponseStatus.PA_NOT_PAID_PAY_IMMEDIATELY:
      return [...PAPayImmediatelyStatus, ...contactYouStatement];
    case ClaimResponseStatus.PA_NOT_PAID_PAY_BY_DATE:
      return [...PAPayByDateStatus, ...contactYouStatement, ...financialDetails];
    case ClaimResponseStatus.PA_NOT_PAID_PAY_INSTALLMENTS:
      return [...PAPayInstallmentsStatus, ...contactYouStatement, ...financialDetails];
    case ClaimResponseStatus.RC_PAID_LESS:
      return RC_PaidLessStatus;
    case ClaimResponseStatus.RC_PAID_FULL:
      return RC_PaidFullStatus;
  }
}

export function buildNextStepsSection(claimId: string, claim: Claim, lang: string, carmApplicable = false): ClaimSummarySection[] {
  const FAPayImmediatelyNextSteps = getFAPayImmediatelyNextSteps(claimId, claim, lang);
  const FAPayByDateNextSteps = getFAPayByDateNextSteps(claimId, claim, lang);
  const FAPayByInstallmentsNextSteps = getFAPayByInstallmentsNextSteps(claimId, claim, lang);
  const PA_AlreadyPaidNextSteps = getPA_AlreadyPaidNextSteps(claim,lang, carmApplicable);
  const PAPayImmediatelyNextSteps = getPAPayImmediatelyNextSteps(claimId, claim, lang, carmApplicable);
  const PAPayByDateNextSteps = getPAPayByDateNextSteps(claimId, claim, lang, carmApplicable);
  const PAPayInstallmentsNextSteps = getPAPayInstallmentsNextSteps(claimId, claim, lang, carmApplicable);
  const RC_PaidLessNextSteps = getRC_PaidLessNextSteps(claim, lang, carmApplicable);
  const RC_PaidFullNextSteps = getRC_PaidFullNextSteps(claim,lang, carmApplicable);
  const RCDisputeNextSteps = getRCDisputeNextSteps(claimId, claim, lang, carmApplicable);

  switch (claim.responseStatus) {
    case ClaimResponseStatus.FA_PAY_IMMEDIATELY:
      return FAPayImmediatelyNextSteps;
    case ClaimResponseStatus.FA_PAY_BY_DATE:
      return FAPayByDateNextSteps;
    case ClaimResponseStatus.FA_PAY_INSTALLMENTS:
      return FAPayByInstallmentsNextSteps;
    case ClaimResponseStatus.RC_DISPUTE:
      return RCDisputeNextSteps;
    case ClaimResponseStatus.PA_ALREADY_PAID:
      return PA_AlreadyPaidNextSteps;
    case ClaimResponseStatus.PA_NOT_PAID_PAY_IMMEDIATELY:
      return PAPayImmediatelyNextSteps;
    case ClaimResponseStatus.PA_NOT_PAID_PAY_BY_DATE:
      return PAPayByDateNextSteps;
    case ClaimResponseStatus.PA_NOT_PAID_PAY_INSTALLMENTS:
      return PAPayInstallmentsNextSteps;
    case ClaimResponseStatus.RC_PAID_LESS:
      return RC_PaidLessNextSteps;
    case ClaimResponseStatus.RC_PAID_FULL:
      return RC_PaidFullNextSteps;
  }
}
