import {Witnesses} from 'models/directionsQuestionnaire/witnesses/witnesses';
import {toCCDYesNo} from 'services/translation/response/convertToCCDYesNo';
import {OtherWitnessItems} from 'models/directionsQuestionnaire/witnesses/otherWitnessItems';

function ccdWitnessDetails(witnessItems: OtherWitnessItems[] | undefined) {
  if (!witnessItems?.length) return undefined;
  const ccdWitnessList = witnessItems.map((witnessItems: OtherWitnessItems) => {
    return {
      value: {
        name : witnessItems?.firstName,
        firstName: witnessItems?.firstName,
        lastName: witnessItems?.lastName,
        emailAddress: witnessItems?.email,
        phoneNumber: witnessItems?.telephone,
        reasonForWitness: witnessItems?.details,
      },
    };
  });
  return ccdWitnessList;
}

export const toCCDWitnesses = (witnesses: Witnesses | undefined) => {
  return {
    witnessesToAppear: toCCDYesNo(witnesses.otherWitnesses.option),
    details: ccdWitnessDetails(witnesses?.otherWitnesses?.witnessItems),
  };
};
