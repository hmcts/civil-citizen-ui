import {YesNoUpperCamelCase} from "form/models/yesNo";

export interface CCDPartnerAndDependent {
  liveWithPartnerRequired?: YesNoUpperCamelCase,
  partnerAgedOver?: YesNoUpperCamelCase,
  haveAnyChildrenRequired?: YesNoUpperCamelCase,
  howManyChildrenByAgeGroup?: CCDChildrenByAgeGroup,
  receiveDisabilityPayments?: YesNoUpperCamelCase,
  supportedAnyoneFinancialRequired?: YesNoUpperCamelCase,
  supportPeopleNumber?: string,
  supportPeopleDetails?: string
}

export interface CCDChildrenByAgeGroup {
  numberOfUnderEleven?: string,
  numberOfElevenToFifteen?: string,
  numberOfSixteenToNineteen?: string,
}
