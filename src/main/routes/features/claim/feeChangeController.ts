import {NextFunction, Response, Router} from "express";
import {CLAIMANT_TASK_LIST_URL, CLAIM_FEE_CHANGE_URL} from "routes/urls";
import {AppRequest, UserDetails} from "models/AppRequest";
import {getCaseDataFromStore} from "modules/draft-store/draftStoreService";
import {CivilServiceClient} from "client/civilServiceClient";
import config from "config";
import {DraftClaimData, getDraftClaimData} from "services/dashboard/draftClaimService";

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);
const feeChangeViewPath = 'features/claim/fee-change';
const feeChangeController = Router();

feeChangeController.get(CLAIM_FEE_CHANGE_URL, async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const user: UserDetails = req.session.user;
    const claim = await getCaseDataFromStore(user?.id);
    const claimFee = await civilServiceClient.getClaimAmountFee(claim?.totalClaimAmount, req);
    const draftClaimData: DraftClaimData = await getDraftClaimData(user?.accessToken);
    const redirectUrl = draftClaimData?.draftClaim ? CLAIMANT_TASK_LIST_URL : draftClaimData.claimCreationUrl;
    res.render(feeChangeViewPath, {claimFee, redirectUrl});
  } catch (error) {
    next(error);
  }
});

export default feeChangeController;
