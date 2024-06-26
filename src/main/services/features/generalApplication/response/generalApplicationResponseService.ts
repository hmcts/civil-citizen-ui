import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {GeneralApplication} from 'common/models/generalApplication/GeneralApplication';
import {selectedApplicationType} from 'common/models/generalApplication/applicationType';
import {Claim} from 'models/claim';
import {YesNo} from 'common/form/models/yesNo';
import {t} from 'i18next';
import {getLng} from 'common/utils/languageToggleUtils';
import {HearingArrangement} from 'models/generalApplication/hearingArrangement';
import {HearingContactDetails} from 'models/generalApplication/hearingContactDetails';
import {GaResponse} from 'models/generalApplication/response/gaResponse';
import {HearingSupport} from 'models/generalApplication/hearingSupport';
import {UnavailableDatesGaHearing} from 'models/generalApplication/unavailableDatesGaHearing';
import {getLast} from 'services/features/generalApplication/generalApplicationService';
import {StatementOfTruthForm} from 'common/models/generalApplication/statementOfTruthForm';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('claimantResponseService');

export const saveRespondentAgreeToOrder = async (claimId: string, claim: Claim, agreeToOrder: YesNo): Promise<void> => {
  try {
    claim.generalApplication = Object.assign(new GeneralApplication(), claim.generalApplication);
    claim.generalApplication.response = Object.assign(new GaResponse(), claim.generalApplication.response);
    claim.generalApplication.response.agreeToOrder = agreeToOrder;
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export function getRespondToApplicationCaption(claim: Claim, lng: string) : string {
  if (claim.generalApplication?.applicationTypes?.length > 1) {
    return t('PAGES.GENERAL_APPLICATION.AGREE_TO_ORDER.RESPOND_TO_MULTIPLE', { lng: getLng(lng) });
  }
  const applicationType = t(selectedApplicationType[getLast(claim.generalApplication?.applicationTypes)?.option], {lng: getLng(lng)}).toLowerCase();
  return t('PAGES.GENERAL_APPLICATION.AGREE_TO_ORDER.RESPOND_TO',
    { lng: getLng(lng), interpolation: { escapeValue: false }, applicationType});
}

export const saveRespondentHearingArrangement = async (claimId: string, hearingArrangement: HearingArrangement): Promise<void> => {
  try {
    const claim = await getCaseDataFromStore(claimId, true);
    claim.generalApplication = Object.assign(new GeneralApplication(), claim.generalApplication);
    claim.generalApplication.response = Object.assign(new GaResponse(), claim.generalApplication.response);
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
    claim.generalApplication.response = Object.assign(new GaResponse(), claim.generalApplication.response);
    claim.generalApplication.response.hearingContactDetails = hearingContactDetails;
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const saveRespondentHearingSupport = async (claimId: string, hearingSupport: HearingSupport): Promise<void> => {
  try {
    const claim = await getCaseDataFromStore(claimId, true);
    claim.generalApplication = Object.assign(new GeneralApplication(), claim.generalApplication);
    claim.generalApplication.response = Object.assign(new GaResponse(), claim.generalApplication.response);
    claim.generalApplication.response.hearingSupport = hearingSupport;
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const saveRespondentUnavailableDates = async (claimId: string, claim: Claim, unavailableDates: UnavailableDatesGaHearing): Promise<void> => {
  try {
    claim.generalApplication = Object.assign(new GeneralApplication(), claim.generalApplication);
    claim.generalApplication.response = Object.assign(new GaResponse(), claim.generalApplication.response);
    while (unavailableDates?.items?.length > 0 && !unavailableDates.items[unavailableDates.items.length - 1].type) {
      unavailableDates?.items.pop();
    }
    claim.generalApplication.response.unavailableDatesHearing = unavailableDates;
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const saveRespondentStatementOfTruth = async (redisKey: string, statementOfTruth: StatementOfTruthForm): Promise<void> => {
  try {
    const claim = await getCaseDataFromStore(redisKey, true);
    claim.generalApplication = Object.assign(new GeneralApplication(), claim.generalApplication);
    const gaResponse = Object.assign(new GaResponse(), claim.generalApplication?.response);
    claim.generalApplication.response = gaResponse;
    gaResponse.statementOfTruth = statementOfTruth;
    await saveDraftClaim(redisKey, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

