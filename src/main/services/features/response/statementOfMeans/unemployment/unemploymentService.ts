import {getResponseDraft, getResponseClaimById, updateResponseDraft} from 'modules/draft-store/response/responseDraftStoreService';
import {Unemployment} from 'common/form/models/statementOfMeans/unemployment/unemployment';
import {UnemploymentDetails} from 'common/form/models/statementOfMeans/unemployment/unemploymentDetails';
import {OtherDetails} from 'common/form/models/statementOfMeans/unemployment/otherDetails';
import {StatementOfMeans} from 'common/models/statementOfMeans';
import {UnemploymentCategory} from 'common/form/models/statementOfMeans/unemployment/unemploymentCategory';
import {AppRequest} from 'models/AppRequest';
import {getRouteParam} from 'common/utils/routeParamUtils';
import {Claim} from 'models/claim';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('employmentService');

export class UnemploymentService {

  public async getUnemployment(req: AppRequest) {
    try {
      const caseId = getRouteParam(req, 'id');
      const claim = await getResponseClaimById(req, caseId);
      if (claim.statementOfMeans?.unemployment) {
        const unemployment = new Unemployment();
        unemployment.option = claim.statementOfMeans.unemployment.option;
        switch (unemployment.option) {
          case UnemploymentCategory.UNEMPLOYED:
            unemployment.unemploymentDetails
              = new UnemploymentDetails(claim.statementOfMeans.unemployment.unemploymentDetails.years.toString(),
                claim.statementOfMeans.unemployment.unemploymentDetails.months.toString());
            break;
          case UnemploymentCategory.OTHER:
            unemployment.otherDetails = new OtherDetails(claim.statementOfMeans.unemployment.otherDetails.details);
            break;
        }
        return unemployment;
      }
      return new Unemployment();
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }

  public async saveUnemployment(req: AppRequest, unemploymentToSave: Unemployment) {
    try {
      const caseId = getRouteParam(req, 'id');
      const draftResult = await getResponseDraft(req, caseId);
      if (!draftResult) {
        throw new Error('[unemploymentService] no response draft found');
      }
      const claim = Object.assign(new Claim(), draftResult.claimResponse?.case_data as unknown as Claim);
      const draftId = draftResult.rawResponse?.draftId;

      if (!claim.statementOfMeans) {
        claim.statementOfMeans = new StatementOfMeans();
      }
      claim.statementOfMeans.unemployment = unemploymentToSave;

      if (draftResult.createdAt && !claim.draftClaimCreatedAt) {
        claim.draftClaimCreatedAt = new Date(draftResult.createdAt);
      }
      await updateResponseDraft(req, caseId, claim, draftId);
    } catch (error) {
      logger.error(error);
      throw error;
    }
  }
}
