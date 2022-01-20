import * as express from 'express';
import { Paths } from '../../../features/response/path';
// import { Paths as ClaimPaths } from '../../../features/claim/paths';
// import { Claim } from 'app/claims/models/claim';
//import { getInterestDetails } from '../../../common/interestUtils';
import { ErrorHandling } from '../../../common/errorHandling';
// import { User } from 'app/idam/user';
//import * as moment from 'moment'
const moment = require('moment');

// function isCurrentUserLinkedToClaim (user: User, claim: Claim): boolean {
//   return claim.defendantId === user.id;
// }

/* tslint:disable:no-default-export */
export default express.Router()
  .get(Paths.claimDetailsPage.uri,
    ErrorHandling.apply(async (req: express.Request, res: express.Response) => {
      //const claim: Claim = res.locals.claim;
      //const interestData = await getInterestDetails(claim);
      const todaysDate = new Date();
      const currentYear = todaysDate.getFullYear();
      const isLeapYear = moment([currentYear]).isLeapYear();
      let numOfDaysInYear = 365;
      if (isLeapYear) {
        numOfDaysInYear = 366;
      }
      res.render(Paths.claimDetailsPage.associatedView, {
        //interestData: interestData,
        numOfDayInYear: numOfDaysInYear,
        //pdfUrl: isCurrentUserLinkedToClaim(res.locals.user, res.locals.claim) ? ClaimPaths.sealedClaimPdfReceiver : ClaimPaths.receiptReceiver
      });
    }),
  );
