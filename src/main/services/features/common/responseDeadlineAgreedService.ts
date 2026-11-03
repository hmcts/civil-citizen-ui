import {Claim} from 'models/claim';
import {AppRequest} from 'models/AppRequest';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {toCUIResponseDeadline} from 'services/translation/convertToCUI/convertToCUIResponseDeadline';
import {getResponseDraft, updateResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';
import {getRouteParam} from 'common/utils/routeParamUtils';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

const setResponseDeadline = async (claim: Claim, req: AppRequest) => {
  const caseId = getRouteParam(req, 'id');
  const agreedDeadlineDate: Date = await civilServiceClient.getAgreedDeadlineResponseDate(caseId, req);
  if (agreedDeadlineDate) {
    agreedDeadlineDate.setUTCHours(16);
    claim.responseDeadline = toCUIResponseDeadline(agreedDeadlineDate);
    claim.respondent1ResponseDeadline = agreedDeadlineDate;
    claim.respondentSolicitor1AgreedDeadlineExtension = agreedDeadlineDate;

    const draftResult = await getResponseDraft(req, caseId);
    if (!draftResult) {
      throw new Error('[responseDeadlineAgreedService] no response draft found');
    }
    const draftId = draftResult.rawResponse?.draftId;
    if (draftResult.createdAt && !claim.draftClaimCreatedAt) {
      claim.draftClaimCreatedAt = new Date(draftResult.createdAt);
    }
    await updateResponseDraft(req, caseId, claim, draftId);
  }
};

export {
  setResponseDeadline,
};
