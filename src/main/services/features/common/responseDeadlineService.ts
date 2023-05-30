import {Claim} from 'models/claim';
import {AppRequest} from 'models/AppRequest';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {toCUIResponseDeadline} from 'services/translation/convertToCUI/convertToCUIResponseDeadline';
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);
const setResponseDeadline = async (claim: Claim, req: AppRequest) => {
  const agreedDeadlineDate: Date = await civilServiceClient.getAgreedDeadlineResponseDate(req.params.id, req);
  claim.responseDeadline = toCUIResponseDeadline(agreedDeadlineDate);

};

export {
  setResponseDeadline,
};
