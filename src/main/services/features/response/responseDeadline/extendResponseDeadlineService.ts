import {getCaseDataFromStore, saveDraftClaim} from '../../../../modules/draft-store/draftStoreService';
import config from 'config';
import {CivilServiceClient} from '../../../../app/client/civilServiceClient';
import {AppRequest} from '../../../../common/models/AppRequest';
import {Claim} from '../../../../common/models/claim';

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

const getClaimWithExtendedResponseDeadline = async (claimId: string, req: AppRequest): Promise<Claim> => {
  const claim = await getCaseDataFromStore(claimId);
  if (!claim.responseDeadline?.agreedResponseDeadline) {
    throw new Error('No extended response deadline found');
  }
  const calculatedExtendedDeadline = await civilServiceClient.calculateExtendedResponseDeadline(claim.responseDeadline?.agreedResponseDeadline, req);
  claim.respondentSolicitor1AgreedDeadlineExtension = calculatedExtendedDeadline;
  await saveDraftClaim(claimId, claim);
  return claim;
};

const submitExtendedResponseDeadline = async (claimId:string, req:AppRequest) => {
  const claim  = await getCaseDataFromStore(claimId);
  await civilServiceClient.submitAgreedResponseExtensionDateEvent(claimId, {respondentSolicitor1AgreedDeadlineExtension: claim.respondentSolicitor1AgreedDeadlineExtension}, req);
  claim.respondent1ResponseDeadline = claim.respondentSolicitor1AgreedDeadlineExtension;
  await saveDraftClaim(claimId, claim);
};

export {
  getClaimWithExtendedResponseDeadline,
  submitExtendedResponseDeadline,
};

