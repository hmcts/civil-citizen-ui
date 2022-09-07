import {AppRequest} from 'models/AppRequest';
import {getCaseDataFromStore} from '../../../../modules/draft-store/draftStoreService';
import config from 'config';
import {CivilServiceClient} from '../../../../app/client/civilServiceClient';
import {Claim} from 'models/claim';
import {translateDraftResponseToCCD} from '../../../translation/response/ccdTranslation';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('partialAdmissionService');

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

export const submitResponse = async (req : AppRequest): Promise<Claim> => {
  try{
    const claim = await getCaseDataFromStore(req.params.id);
    const ccdResponse = translateDraftResponseToCCD(claim);
    console.log(ccdResponse);
    return await civilServiceClient.submitDefendantResponseEvent(req.params.id, ccdResponse, req);
  }catch(err){
    logger.error(err);
    throw err;
  }
};
