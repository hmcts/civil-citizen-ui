import {NextFunction, RequestHandler, Response, Router} from 'express';
import {CLAIM_FEE_CHANGE_URL, CLAIMANT_TASK_LIST_URL} from 'routes/urls';
import {AppRequest, UserDetails} from 'models/AppRequest';
import {DraftClaimData, getDraftClaimData} from 'services/dashboard/draftClaimService';
import {getClaimById} from 'modules/utilityService';
import {convertToPoundsFilter} from 'common/utils/currencyFormat';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';

const feeChangeViewPath = 'features/claim/fee-change';
const feeChangeController = Router();

const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

feeChangeController.get(CLAIM_FEE_CHANGE_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const user: UserDetails = req.session.user;
    const claim = await getClaimById(req.params.id, req, true);
    const newClaimFeeData = await civilServiceClient.getClaimFeeData(claim.totalClaimAmount, req);
    const claimFee =  convertToPoundsFilter(newClaimFeeData.calculatedAmountInPence);
    const draftClaimData: DraftClaimData = await getDraftClaimData(user?.accessToken, user?.id);
    const redirectUrl = draftClaimData?.draftClaim ? CLAIMANT_TASK_LIST_URL : draftClaimData.claimCreationUrl;
    return res.render(feeChangeViewPath, {claimFee, redirectUrl});
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default feeChangeController;
