
import * as express from 'express';
import {getDirectionQuestionnaire} from './directionQuestionnaireService';
import {OtherWitnessItems} from '../../../common/models/directionsQuestionnaire/witnesses/otherWitnessItems';
import {OtherWitnesses} from '../../../common/models/directionsQuestionnaire/witnesses/otherWitnesses';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('otherWitnessesService');

export const getOtherWitnesses = async (req: express.Request): Promise<OtherWitnesses> => {
  try{
    const directionQuestionnaire = await getDirectionQuestionnaire(req.params.id);
    if (directionQuestionnaire?.witnesses?.otherWitnesses) {
      return directionQuestionnaire?.witnesses?.otherWitnesses;
    }
    return new OtherWitnesses(undefined, [new OtherWitnessItems()]);
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
