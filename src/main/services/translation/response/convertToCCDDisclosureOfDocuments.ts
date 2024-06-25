import {toCCDYesNo} from 'services/translation/response/convertToCCDYesNo';
import {Claim} from 'models/claim';
import {
  HasAnAgreementBeenReachedOptions,
} from 'models/directionsQuestionnaire/mintiMultitrack/hasAnAgreementBeenReachedOptions';
import {TypeOfDisclosureDocument} from 'models/directionsQuestionnaire/hearing/disclosureOfDocuments';
import {YesNo} from 'form/models/yesNo';

export const toCCDDisclosureOfElectronicDocuments = (claim: Claim) => {
  if (claim.directionQuestionnaire?.hearing?.disclosureOfDocuments?.documentsTypeChosen?.includes(TypeOfDisclosureDocument.ELECTRONIC)) {
    const hasAnAgreementBeenReached = claim.directionQuestionnaire?.hearing?.hasAnAgreementBeenReached;
    let ccdAgreement;
    let agreementLikely;
    let reasons;
    if (hasAnAgreementBeenReached === HasAnAgreementBeenReachedOptions.YES) {
      ccdAgreement = toCCDYesNo(hasAnAgreementBeenReached.toLowerCase());
    } else if (hasAnAgreementBeenReached === HasAnAgreementBeenReachedOptions.NO_BUT_AN_AGREEMENT_IS_LIKELY) {
      ccdAgreement = toCCDYesNo(YesNo.NO);
      agreementLikely = toCCDYesNo(YesNo.YES);
      reasons = claim.directionQuestionnaire?.hearing?.disclosureOfElectronicDocumentsIssues;
    } else if (hasAnAgreementBeenReached === HasAnAgreementBeenReachedOptions.NO) {
      ccdAgreement = toCCDYesNo(hasAnAgreementBeenReached);
      agreementLikely = toCCDYesNo(YesNo.NO);
      reasons = claim.directionQuestionnaire?.hearing?.disclosureOfElectronicDocumentsIssues;
    }
    return {
      reachedAgreement: ccdAgreement,
      agreementLikely: agreementLikely,
      reasonForNoAgreement: reasons,
    };
  }
};

export const toCCDDisclosureOfNonElectronicDocuments = (claim: Claim) => {
  if (claim.directionQuestionnaire?.hearing?.disclosureOfDocuments?.documentsTypeChosen?.includes(TypeOfDisclosureDocument.NON_ELECTRONIC)) {
    return {
      bespokeDirections: claim.directionQuestionnaire?.hearing?.disclosureNonElectronicDocument,
    };
  }
};

