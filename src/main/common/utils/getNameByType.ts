import {Claim} from "../../common/models/claim";
import {CounterpartyType} from "../../common/models/counterpartyType";

const getClaimantName = (claim: Claim): string => {
  if (claim.applicant1.type === CounterpartyType.INDIVIDUAL || claim.applicant1.type === CounterpartyType.SOLE_TRADER) {
    return claim.applicant1.individualTitle + ' ' + claim.applicant1.individualFirstName + ' ' + claim.applicant1.individualLastName;
  } else if (claim.applicant1.type === CounterpartyType.ORGANISATION || claim.applicant1.type === CounterpartyType.COMPANY) {
    return claim.applicant1.partyName;
  }
}

const getDefendantName = (claim: Claim): string => {
  if (claim.respondent1.type === CounterpartyType.INDIVIDUAL || claim.respondent1.type === CounterpartyType.SOLE_TRADER) {
    return claim.respondent1.individualTitle + ' ' + claim.respondent1.individualFirstName + ' ' + claim.respondent1.individualLastName;
  } else if (claim.respondent1.type === CounterpartyType.ORGANISATION || claim.respondent1.type === CounterpartyType.COMPANY) {
    return claim.respondent1.partyName;
  }
}

export { getClaimantName, getDefendantName }