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
  const FAPAyImmediatelyStatus = getFAPAyImmediatelyStatus(claim, lang);
  const FAPayByDateStatus = getFAPayByDateStatus(claim, lang);
  const FAPayByInstallmentsStatus = getFAPayByInstallmentsStatus(claim, lang);
  const contactYouStatement = getContactYouStatement(lang);
  const financialDetails = getfinancialDetails(claimId, claim, lang);
  const PAPayImmediatelyStatus = getPAPayImmediatelyStatus(claim, lang);
  const PAPayByDateStatus = getPAPayByDateStatus(claim, lang);
  const PAPayInstallmentsStatus = getPAPayInstallmentsStatus(claim, lang);

  switch (claim.responseStatus) {
    case ClaimResponseStatus.FA_PAY_IMMEDIATELY:
      return FAPAyImmediatelyStatus;
    case ClaimResponseStatus.FA_PAY_BY_DATE:
      return [...FAPayByDateStatus, ...contactYouStatement, ...financialDetails];
    case ClaimResponseStatus.FA_PAY_INSTALLMENTS:
      return [...FAPayByInstallmentsStatus, ...contactYouStatement, ...financialDetails];  
    case ClaimResponseStatus.PA_NOT_PAID_PAY_IMMEDIATELY:
      return [...PAPayImmediatelyStatus, ...contactYouStatement];
    case ClaimResponseStatus.PA_NOT_PAID_PAY_BY_DATE:
      return [...PAPayByDateStatus, ...contactYouStatement, ...financialDetails];
    case ClaimResponseStatus.PA_NOT_PAID_PAY_INSTALLMENTS:
      return [...PAPayInstallmentsStatus, ...contactYouStatement, ...financialDetails];
  }
}

export function buildNextStepsSection(claimId: string, claim: Claim, lang:string): ClaimSummarySection[] {
  const FAPayImmediatelyNextSteps = getFAPayImmediatelyNextSteps(claimId, claim, lang);
  const FAPayByDateNextSteps = getFAPayByDateNextSteps(claimId, claim, lang);
  const FAPayByInstallmentsNextSteps = getFAPayByInstallmentsNextSteps(claimId, claim, lang);
  // TODO: refactor put this consts inside his case to avoid call all if not needed
  const PAPayImmediatelyNextSteps = getPAPayImmediatelyNextSteps(claimId, claim, lang);
  const PAPayByDateNextSteps = getPAPayByDateNextSteps(claimId, claim, lang);
  const PAPayInstallmentsNextSteps = getPAPayInstallmentsNextSteps(claimId, claim, lang);

  switch (claim.responseStatus) {
    case ClaimResponseStatus.FA_PAY_IMMEDIATELY:
      return FAPayImmediatelyNextSteps;
    case ClaimResponseStatus.FA_PAY_BY_DATE:
      return FAPayByDateNextSteps;
    case ClaimResponseStatus.FA_PAY_INSTALLMENTS:
      return FAPayByInstallmentsNextSteps;
    case ClaimResponseStatus.PA_NOT_PAID_PAY_IMMEDIATELY:
      return PAPayImmediatelyNextSteps;
    case ClaimResponseStatus.PA_NOT_PAID_PAY_BY_DATE:
      return PAPayByDateNextSteps;
    case ClaimResponseStatus.PA_NOT_PAID_PAY_INSTALLMENTS:
      return PAPayInstallmentsNextSteps;
  }
}
