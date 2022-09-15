import {Claim} from '../../../../../common/models/claim';
import {ClaimSummarySection} from '../../../../../common/form/models/claimSummarySection';
import {
  getFAPAyImmediatelyStatus,
  getFAPayByDateStatus,
  getFAPayByInstallmentsStatus,
  getfinancialDetails,
  getContactYouStatement,
  getFAPayImmediatelyNextSteps,
  getFAPayByDateNextSteps,
  getFAPayByInstallmentsNextSteps,
} from './admissionSubmitConfirmationContent';
import {ClaimResponseStatus} from '../../../../../common/models/claimResponseStatus';
import {
  getPAPayByDateNextSteps,
  getPAPayByDateStatus,
  getPAPayImmediatelyNextSteps,
  getPAPayImmediatelyStatus,
  getPAPayInstallmentsNextSteps,
  getPAPayInstallmentsStatus,
} from './partAdmissionConfirmationContent';

export function buildSubmitStatus(claimId: string, claim: Claim, lang: string): ClaimSummarySection[] {
  const contactYouStatement = getContactYouStatement(lang);
  const financialDetails = getfinancialDetails(claimId, claim, lang);

  switch (claim.responseStatus) {
    case ClaimResponseStatus.FA_PAY_IMMEDIATELY:
      const FAPAyImmediatelyStatus = getFAPAyImmediatelyStatus(claim, lang);
      return FAPAyImmediatelyStatus;
    case ClaimResponseStatus.FA_PAY_BY_DATE:
      const FAPayByDateStatus = getFAPayByDateStatus(claim, lang);
      return [...FAPayByDateStatus, ...contactYouStatement, ...financialDetails];
    case ClaimResponseStatus.FA_PAY_INSTALLMENTS:
      const FAPayByInstallmentsStatus = getFAPayByInstallmentsStatus(claim, lang);
      return [...FAPayByInstallmentsStatus, ...contactYouStatement, ...financialDetails];
    case ClaimResponseStatus.PA_NOT_PAID_PAY_IMMEDIATELY:
      const PAPayImmediatelyStatus = getPAPayImmediatelyStatus(claim, lang);
      return [...PAPayImmediatelyStatus, ...contactYouStatement];
    case ClaimResponseStatus.PA_NOT_PAID_PAY_BY_DATE:
      const PAPayByDateStatus = getPAPayByDateStatus(claim, lang);
      return [...PAPayByDateStatus, ...contactYouStatement, ...financialDetails];
    case ClaimResponseStatus.PA_NOT_PAID_PAY_INSTALLMENTS:
      const PAPayInstallmentsStatus = getPAPayInstallmentsStatus(claim, lang);
      return [...PAPayInstallmentsStatus, ...contactYouStatement, ...financialDetails];
  }
}

export function buildNextStepsSection(claimId: string, claim: Claim, lang: string): ClaimSummarySection[] {
  switch (claim.responseStatus) {
    case ClaimResponseStatus.FA_PAY_IMMEDIATELY:
      const FAPayImmediatelyNextSteps = getFAPayImmediatelyNextSteps(claimId, claim, lang);
      return FAPayImmediatelyNextSteps;
    case ClaimResponseStatus.FA_PAY_BY_DATE:
      const FAPayByDateNextSteps = getFAPayByDateNextSteps(claimId, claim, lang);
      return FAPayByDateNextSteps;
    case ClaimResponseStatus.FA_PAY_INSTALLMENTS:
      const FAPayByInstallmentsNextSteps = getFAPayByInstallmentsNextSteps(claimId, claim, lang);
      return FAPayByInstallmentsNextSteps;
    case ClaimResponseStatus.PA_NOT_PAID_PAY_IMMEDIATELY:
      const PAPayImmediatelyNextSteps = getPAPayImmediatelyNextSteps(claimId, claim, lang);
      return PAPayImmediatelyNextSteps;
    case ClaimResponseStatus.PA_NOT_PAID_PAY_BY_DATE:
      const PAPayByDateNextSteps = getPAPayByDateNextSteps(claimId, claim, lang);
      return PAPayByDateNextSteps;
    case ClaimResponseStatus.PA_NOT_PAID_PAY_INSTALLMENTS:
      const PAPayInstallmentsNextSteps = getPAPayInstallmentsNextSteps(claimId, claim, lang);
      return PAPayInstallmentsNextSteps;
  }
}
