import {Disability} from 'common/form/models/statementOfMeans/disability';
import {DraftStoreService} from '../../modules/draft-store/draftStoreService';
import {StatementOfMeans} from '../../common/models/statementOfMeans';

export class DisabilityService {


  public async getDisability(claimId: string) {
    const draftStoreService = new DraftStoreService();
    const claim = await draftStoreService.getCaseDataFormStore(claimId);
    console.log(claim);
    if (claim && claim.statementOfMeans && claim.statementOfMeans.disability) {
      return claim.statementOfMeans.disability;
    }
    return new Disability('');
  }

  public async saveDisability(claimId: string, disability: Disability) {
    const draftStoreService = new DraftStoreService();
    const claim = await draftStoreService.getCaseDataFormStore(claimId);
    console.log(claim);
    if (claim.statementOfMeans) {
      claim.statementOfMeans.disability = disability;
    } else {
      const statementOfMeans = new StatementOfMeans();
      statementOfMeans.disability = disability;
      claim.statementOfMeans = statementOfMeans;
    }
    await draftStoreService.saveDraftClaim(claimId, claim);
  }
}
