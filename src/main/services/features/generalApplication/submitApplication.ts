import {AppRequest} from 'common/models/AppRequest';
import config from 'config';
import {
  translateCoScApplicationToCCD,
  translateDraftApplicationToCCD,
} from 'services/translation/generalApplication/ccdTranslation';
import {getClaimById} from 'modules/utilityService';
import {CivilServiceClient} from 'client/civilServiceClient';
import { Claim } from 'common/models/claim';
import {YesNo} from 'form/models/yesNo';
import {InformOtherParties} from 'models/generalApplication/informOtherParties';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('partialAdmissionService');

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

export const submitApplication = async (req: AppRequest): Promise<Claim> => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    const ccdApplication = translateDraftApplicationToCCD(claim.generalApplication);
    return await civilServiceClient.submitInitiateGeneralApplicationEvent(claimId, ccdApplication, req);
  } catch (err) {
    logger.error(err);
    throw err;
  }
};

export const submitCoScApplication = async (req: AppRequest): Promise<Claim> => {
  try {
    const claimId = req.params.id;
    const claim = await getClaimById(claimId, req, true);
    //dummuy value for cosc app
    claim.generalApplication.agreementFromOtherParty = YesNo.NO;
    //without notice for cosc app
    const informOtherParties = new InformOtherParties('No', 'DummyVal');
    claim.generalApplication.informOtherParties = informOtherParties;
    const ccdApplication = translateCoScApplicationToCCD(claim.generalApplication);
    return await civilServiceClient.submitInitiateGeneralApplicationEventForCosc(claimId, ccdApplication, req);
  } catch (err) {
    logger.error(err);
    throw err;
  }
};
