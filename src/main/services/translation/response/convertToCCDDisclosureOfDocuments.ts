import {toCCDYesNo} from 'services/translation/response/convertToCCDYesNo';

import {
  HasAnAgreementBeenReachedOptions,
} from 'models/directionsQuestionnaire/mintiMultitrack/hasAnAgreementBeenReachedOptions';
import {TypeOfDisclosureDocument} from 'models/directionsQuestionnaire/hearing/disclosureOfDocuments';
import {YesNo} from 'form/models/yesNo';
import {Hearing} from 'models/directionsQuestionnaire/hearing/hearing';

export const toCCDDisclosureOfElectronicDocuments = (hearing: Hearing) => {
  if (hearing?.disclosureOfDocuments?.documentsTypeChosen?.includes(TypeOfDisclosureDocument.ELECTRONIC)) {
    const hasAnAgreementBeenReached = hearing?.hasAnAgreementBeenReached;
    let ccdAgreement;
    let agreementLikely;
    let reasons;
    if (hasAnAgreementBeenReached === HasAnAgreementBeenReachedOptions.YES) {
      ccdAgreement = toCCDYesNo(hasAnAgreementBeenReached.toLowerCase());
    } else if (hasAnAgreementBeenReached === HasAnAgreementBeenReachedOptions.NO_BUT_AN_AGREEMENT_IS_LIKELY) {
      ccdAgreement = toCCDYesNo(YesNo.NO);
      agreementLikely = toCCDYesNo(YesNo.YES);
      reasons = hearing?.disclosureOfElectronicDocumentsIssues;
    } else if (hasAnAgreementBeenReached === HasAnAgreementBeenReachedOptions.NO) {
      ccdAgreement = toCCDYesNo(hasAnAgreementBeenReached);
      agreementLikely = toCCDYesNo(YesNo.NO);
      reasons = hearing?.disclosureOfElectronicDocumentsIssues;
    }
    return {
      reachedAgreement: ccdAgreement,
      agreementLikely: agreementLikely,
      reasonForNoAgreement: reasons,
    };
  }
};

export const toCCDDisclosureOfNonElectronicDocuments = (hearing: Hearing) => {
  if (hearing?.disclosureOfDocuments?.documentsTypeChosen?.includes(TypeOfDisclosureDocument.NON_ELECTRONIC)) {
    return {
      bespokeDirections: hearing?.disclosureNonElectronicDocument,
    };
  }
};

