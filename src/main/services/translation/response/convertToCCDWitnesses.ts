import {Witnesses} from 'models/directionsQuestionnaire/witnesses/witnesses';
import {toCCDYesNo} from 'services/translation/response/convertToCCDYesNo';
import {CCDWitnessDetails} from 'models/ccdResponse/ccdWitnesses';
import {OtherWitnessItems} from 'models/directionsQuestionnaire/witnesses/otherWitnessItems';

function ccdWitnessDetails(witnessItems: OtherWitnessItems[] | undefined) {
  if(!witnessItems.length) return undefined;
  const witnessDetails : CCDWitnessDetails[] = [];
  witnessItems.forEach((witness, index) => {
    const witness : CCDWitnessDetails = {
      details : {

      },
    };
  });

  return witnessDetails;
}

export const toCCDWitnesses = (witnesses: Witnesses | undefined) => {
  return {
    witnessesToAppear: toCCDYesNo(witnesses.otherWitnesses.option),
    details: ccdWitnessDetails(witnesses?.otherWitnesses?.witnessItems),
  };
};
