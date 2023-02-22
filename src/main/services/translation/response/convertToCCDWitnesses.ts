import {Witnesses} from 'models/directionsQuestionnaire/witnesses/witnesses';
import {toCCDYesNo} from 'services/translation/response/convertToCCDYesNo';
import {CCDWitnessDetails} from 'models/ccdResponse/ccdWitnesses';
import {OtherWitnessItems} from 'models/directionsQuestionnaire/witnesses/otherWitnessItems';

function ccdWitnessDetails(witnessItems: OtherWitnessItems[] | undefined) {
  if (!witnessItems?.length) return undefined;
  const ccdWitnessList: CCDWitnessDetails[] = [];

  witnessItems.forEach((CCDWitnessItem, index) => {
    const ccdWitnessesDetails: CCDWitnessDetails = {
      value: {
        name : CCDWitnessItem?.firstName,
        firstName: CCDWitnessItem?.firstName,
        lastName: CCDWitnessItem?.lastName,
        emailAddress: CCDWitnessItem?.email,
        phoneNumber: CCDWitnessItem?.telephone,
        reasonForWitness: CCDWitnessItem?.details,
      },
    };
    ccdWitnessList.push(ccdWitnessesDetails);
  });

  return ccdWitnessList;
}

export const toCCDWitnesses = (witnesses: Witnesses | undefined) => {
  return {
    witnessesToAppear: toCCDYesNo(witnesses.otherWitnesses.option),
    details: ccdWitnessDetails(witnesses?.otherWitnesses?.witnessItems),
  };
};
