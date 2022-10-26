export interface CCDPartnerAndDependent {
  haveAnyChildrenRequired: string, // TODO: YES or NO
  howManyChildrenByAgeGroup: {
    numberOfUnderEleven: string,
    numberOfElevenToFifteen: string,
    numberOfSixteenToNineteen: string,
  },
  liveWithPartnerRequired: string, // TODO: YES or NO
  partnerAgedOver: string, // TODO: YES or NO
  receiveDisabilityPayments: string, // TODO: YES or NO
  supportPeopleDetails: string,
  supportPeopleNumber: string,
  supportedAnyoneFinancialRequired: string, // TODO: YES or NO

};
