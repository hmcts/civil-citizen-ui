import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {GeneralApplication} from 'common/models/generalApplication/GeneralApplication';
import {selectedApplicationType} from 'common/models/generalApplication/applicationType';
import {Claim} from 'models/claim';
import {YesNo} from 'common/form/models/yesNo';
import {t} from 'i18next';
import {getLng} from 'common/utils/languageToggleUtils';
import {HearingArrangement} from 'models/generalApplication/hearingArrangement';
import {HearingContactDetails} from 'models/generalApplication/hearingContactDetails';
import {Response} from 'models/generalApplication/response/response';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimantResponseService');

export const saveRespondentAgreeToOrder = async (claimId: string, claim: Claim, agreeToOrder: YesNo): Promise<void> => {
  try {
    claim.generalApplication = Object.assign(new GeneralApplication(), claim.generalApplication);
    claim.generalApplication.response = Object.assign(new Response(), claim.generalApplication.response);
    claim.generalApplication.response.agreeToOrder = agreeToOrder;
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export function getRespondToApplicationCaption(claim: Claim, lng: string) : string {
  const applicationType = t(selectedApplicationType[claim.generalApplication?.applicationType?.option], {lng: getLng(lng)}).toLowerCase();
  return t('PAGES.GENERAL_APPLICATION.AGREE_TO_ORDER.RESPOND_TO', { lng: getLng(lng), applicationType});
}

export const saveRespondentHearingArrangement = async (claimId: string, hearingArrangement: HearingArrangement): Promise<void> => {
  try {
    const claim = await getCaseDataFromStore(claimId, true);
    claim.generalApplication = Object.assign(new GeneralApplication(), claim.generalApplication);
    claim.generalApplication.response = Object.assign(new Response(), claim.generalApplication.response);
    claim.generalApplication.response.hearingArrangement = hearingArrangement;
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const saveRespondentHearingContactDetails = async (claimId: string, hearingContactDetails: HearingContactDetails): Promise<void> => {
  try {
    const claim = await getCaseDataFromStore(claimId, true);
    claim.generalApplication = Object.assign(new GeneralApplication(), claim.generalApplication);
    claim.generalApplication.response = Object.assign(new Response(), claim.generalApplication.response);
    claim.generalApplication.response.hearingContactDetails = hearingContactDetails;
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
