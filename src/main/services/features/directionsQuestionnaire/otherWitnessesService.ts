import {Request} from 'express';
import {ValidationError} from 'class-validator';
import {getDirectionQuestionnaire} from './directionQuestionnaireService';
import {OtherWitnessItems} from '../../../common/models/directionsQuestionnaire/witnesses/otherWitnessItems';
import {OtherWitnesses} from '../../../common/models/directionsQuestionnaire/witnesses/otherWitnesses';
import {AppRequest} from 'common/models/AppRequest';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';
import {GenericForm} from 'form/models/genericForm';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('otherWitnessesService');

export const getOtherWitnesses = async (req: Request): Promise<OtherWitnesses> => {
  try{
    const directionQuestionnaire = await getDirectionQuestionnaire(generateRedisKey(<AppRequest>req));
    if (directionQuestionnaire?.witnesses?.otherWitnesses) {
      return directionQuestionnaire?.witnesses?.otherWitnesses;
    }
    return new OtherWitnesses();
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const getOtherWitnessDetailsForm = (req: Request): OtherWitnessItems[] => {
  return req.body.witnessItems.map((item: OtherWitnessItems) => {
    return new OtherWitnessItems(item);
  });
};

export const validateOtherWitnesses = (otherWitnesses?: OtherWitnesses): ValidationError[] => {
  if (!otherWitnesses) {
    return [];
  }

  const witnessItems = otherWitnesses.witnessItems?.map((item: OtherWitnessItems) => new OtherWitnessItems(item));
  const form = new GenericForm(new OtherWitnesses(otherWitnesses.option, witnessItems));
  form.validateSync();

  return form.getAllErrors().filter(error => error.text);
};
