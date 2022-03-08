import {app} from '../../../main/app';


export class DraftStoreClient(){

  function getClaimFromStore(claimId: string){
    app.locals.draftStoreClient.get(claimId);
  }
}
