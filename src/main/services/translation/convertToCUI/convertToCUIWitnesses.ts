import {Witnesses} from "models/directionsQuestionnaire/witnesses/witnesses";
import {CCDWitnessDetails, CCDWitnesses} from "models/ccdResponse/ccdWitnesses";
import {OtherWitnesses} from "models/directionsQuestionnaire/witnesses/otherWitnesses";
import {YesNo} from "form/models/yesNo";

export const toCUIWitnesses = (ccdWitnesses: CCDWitnesses) : Witnesses => {
  if (ccdWitnesses?.witnessesToAppear || ccdWitnesses?.details?.length) {
    const otherWitness = new OtherWitnesses
    const witnessItems =
      ccdWitnesses.details.map((ccdWitnessDetails: CCDWitnessDetails) => {
        return {
          firstName: ccdWitnessDetails.value?.firstName,
          lastName: ccdWitnessDetails.value?.lastName,
          email: ccdWitnessDetails.value?.emailAddress,
          telephone: ccdWitnessDetails.value?.phoneNumber,
          details: ccdWitnessDetails?.value?.reasonForWitness
        };
      });
    otherWitness.option = YesNo.YES
    otherWitness.witnessItems = witnessItems
    const witness : Witnesses = {
      otherWitnesses : otherWitness
    }
    return witness
  }
  return
}
