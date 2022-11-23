import {NextFunction, Request, Response} from 'express';
import {Claim} from '../../common/models/claim';
import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';
import {DASHBOARD_URL} from '../../routes/urls';

export const responseSubmitDateGuard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const claim: Claim = await getCaseDataFromStore(req.params?.id);
    return (claim?.isResponseDateInThePast())
      ? next()
      : res.redirect(DASHBOARD_URL);
  } catch (error) {
    next(error);
  }
};
