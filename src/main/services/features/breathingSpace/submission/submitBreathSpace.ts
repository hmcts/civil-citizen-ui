import config from "config";
import {CivilServiceClient} from "client/civilServiceClient";
import {AppRequest} from "models/AppRequest";
import {CaseEvent} from "models/events/caseEvent";
import {BreathingSpace} from "models/breathingSpace";

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('partialAdmissionService');

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

export const submitBreathingSpace = async (claimId:string, breathingSpace: BreathingSpace, req: AppRequest): Promise<any> =>{
  try {
    const ccdBreathingSpace = "callTranslate here";
    logger.info(ccdBreathingSpace)
    civilServiceClient.submitBreathingSpaceEvent(CaseEvent.ENTER_BREATHING_SPACE_SPEC, claimId, breathingSpace, req);
  }catch (err) {
    logger.error(err);
    throw err;
  }