import {NextFunction, Response, Router} from 'express';
import {AppRequest} from 'models/AppRequest';
import {CivilServiceClient} from "client/civilServiceClient";
import config from "config";
import {YesNoUpperCamelCase} from "form/models/yesNo";
import {ClaimUpdate} from "models/events/eventDto";

const queryManagementController = Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

queryManagementController.get('/:claimId/create-query', (async (req: AppRequest, res: Response, next: NextFunction) => {
  const claimId = req.params.claimId;
  res.render('features/queryManagement/createQuery', {claimId});
}));

queryManagementController.post('/:claimId/create-query', (async (req: AppRequest, res: Response, next: NextFunction) => {
  const claimId = req.params.claimId;
  // const queryData = req.body;
  const claim = await civilServiceClient.retrieveClaimDetails(claimId, req);
  claim.qmApplicantCitizenQueries = {
    partyName: 'bob smith',
    roleOnCase: 'leader',
    caseMessages: [{
      id: '0c590a44-7fe3-49fd-a419-036395d821a4',
      value: {
        id: '098285d4-248b-45af-9023-d5612c305e5f',
        subject: 'sub',
        name: 'Bob',
        body: 'bodyyyy',
        isHearingRelated: YesNoUpperCamelCase.NO,
        createdOn: Date.now(),
        createdBy: '0c590a44-7fe3-49fd-a419-036395d821a4',
      },
    }],
  };
  const updatedClaim = {...claim} as ClaimUpdate;
  console.log(updatedClaim);
  console.log(updatedClaim.qmApplicantCitizenQueries.caseMessages);
  const response = await civilServiceClient.submitQueryManagementRaiseQuery(claimId, updatedClaim, req);
  console.log(response);
}));

export default queryManagementController;
