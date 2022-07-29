import express from 'express';
import {Claim} from '../../common/models/claim';
import {getCaseDataFromStore} from '../../modules/draft-store/draftStoreService';
import {ResponseOptions} from '../../common/form/models/responseDeadline';

export const deadLineGuard = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const caseData: Claim = await getCaseDataFromStore(req.session.claimId);
  if (caseData.responseDeadline?.option === ResponseOptions.ALREADY_AGREED && caseData.responseDeadline?.agreedResponseDeadline) {
    res.status(401).json("Unauthorized");
  } else {
    next();
  }
};
