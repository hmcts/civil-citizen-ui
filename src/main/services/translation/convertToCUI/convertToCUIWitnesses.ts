import {Witnesses} from 'models/directionsQuestionnaire/witnesses/witnesses';
import {CCDWitnessDetails, CCDWitnesses} from 'models/ccdResponse/ccdWitnesses';
import {OtherWitnesses} from 'models/directionsQuestionnaire/witnesses/otherWitnesses';
import {toCUIYesNo} from 'services/translation/convertToCUI/convertToCUIYesNo';

export const toCUIWitnesses = (ccdWitnesses: CCDWitnesses) : Witnesses => {
  if (ccdWitnesses?.witnessesToAppear && ccdWitnesses?.details) {
    const otherWitness = new OtherWitnesses;
    const witnessItems =
      ccdWitnesses.details.map((ccdWitnessDetails: CCDWitnessDetails) => {
        return {
          firstName: ccdWitnessDetails.value?.firstName,
          lastName: ccdWitnessDetails.value?.lastName,
          email: ccdWitnessDetails.value?.emailAddress,
          telephone: ccdWitnessDetails.value?.phoneNumber,
          details: ccdWitnessDetails.value?.reasonForWitness,
        };
      });
    otherWitness.option = toCUIYesNo(ccdWitnesses.witnessesToAppear);
    otherWitness.witnessItems = witnessItems;
    return {
      otherWitnesses : otherWitness,
    };
  }
};
