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

export function buildSubmitStatus(claimId: string, claim: Claim, lang: string): ClaimSummarySection[] {
  const FAPAyImmediatelyStatus = getFAPAyImmediatelyStatus(claim);
  const FAPayByDateStatus = getFAPayByDateStatus(claim, lang);
  const FAPayByInstallmentsStatus = getFAPayByInstallmentsStatus(claim);
  const contactYouStatement = getContactYouStatement(claim);
  const financialDetails = getfinancialDetails(claimId, claim, lang);
  
  switch (claim.responseStatus) {
    case ClaimResponseStatus.FA_PAY_IMMEDIATELY:
      return FAPAyImmediatelyStatus;
    case ClaimResponseStatus.FA_PAY_BY_DATE:
      return [...FAPayByDateStatus, ...contactYouStatement, ...financialDetails];
    case ClaimResponseStatus.FA_PAY_INSTALLMENTS:
      return [...FAPayByInstallmentsStatus, ...contactYouStatement, ...financialDetails];  
  }
}

export function buildNextStepsSection(claimId: string, claim: Claim, lang:string): ClaimSummarySection[] {
  const FAPayImmediatelyNextSteps = getFAPayImmediatelyNextSteps(claimId, claim, lang);
  const FAPayByDateNextSteps = getFAPayByDateNextSteps(claimId, claim, lang);
  const FAPayByInstallmentsNextSteps = getFAPayByInstallmentsNextSteps(claimId, claim, lang);

  switch (claim.responseStatus) {
    case ClaimResponseStatus.FA_PAY_IMMEDIATELY:
      return FAPayImmediatelyNextSteps;
    case ClaimResponseStatus.FA_PAY_BY_DATE:
      return FAPayByDateNextSteps;
    case ClaimResponseStatus.FA_PAY_INSTALLMENTS:
      return FAPayByInstallmentsNextSteps;
  }
}
