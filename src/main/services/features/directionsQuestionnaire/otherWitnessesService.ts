
import * as express from 'express';
import {getDirectionQuestionnaire} from './directionQuestionnaireService';
import {OtherWitnessItems} from '../../../common/models/directionsQuestionnaire/witnesses/otherWitnessItems';
import {OtherWitnesses} from '../../../common/models/directionsQuestionnaire/witnesses/otherWitnesses';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('otherWitnessesService');

export const getOtherWitnesses = async (req: express.Request): Promise<OtherWitnesses> => {
  try{
    const directionQuestionnaire = await getDirectionQuestionnaire(req.params.id);
    if (directionQuestionnaire?.witnesses) {
      const witnesses = directionQuestionnaire.witnesses;
      witnesses.otherWitnesses.witnessItems = witnesses?.otherWitnesses?.witnessItems.map(item => new OtherWitnessItems(item));
      return new OtherWitnesses(witnesses?.otherWitnesses?.option, witnesses?.otherWitnesses?.witnessItems);
    }
    return new OtherWitnesses();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const getOtherWitnessDetailsForm = (req: express.Request): OtherWitnessItems[] => {
  return req.body.witnessItems.map((item: OtherWitnessItems) => {
    return new OtherWitnessItems(item);
  });
};
