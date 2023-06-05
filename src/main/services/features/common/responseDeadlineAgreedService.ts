import {Claim} from 'models/claim';
import {AppRequest} from 'models/AppRequest';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {toCUIResponseDeadline} from 'services/translation/convertToCUI/convertToCUIResponseDeadline';
import {saveDraftClaim} from 'modules/draft-store/draftStoreService';
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);
const setResponseDeadline = async (claim: Claim, req: AppRequest) => {
  const claimId : string = claim.id ? claim.id : req.params.id;
  const agreedDeadlineDate: Date = await civilServiceClient.getAgreedDeadlineResponseDate(claimId, req);
  claim.responseDeadline = toCUIResponseDeadline(agreedDeadlineDate);
  claim.respondentSolicitor1AgreedDeadlineExtension = agreedDeadlineDate;
  await saveDraftClaim(claim.id,  claim);
};

export {
  setResponseDeadline,
};
