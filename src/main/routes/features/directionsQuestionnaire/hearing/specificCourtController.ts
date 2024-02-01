import {NextFunction, Request, RequestHandler, Response, Router} from 'express';
import {DQ_COURT_LOCATION_URL, DQ_WELSH_LANGUAGE_URL} from 'routes/urls';
import {SpecificCourtLocation} from 'models/directionsQuestionnaire/hearing/specificCourtLocation';
import {GenericForm} from 'common/form/models/genericForm';

import {
  getListOfCourtLocations,
  getSpecificCourtLocationForm,
} from 'services/features/directionsQuestionnaire/hearing/specificCourtLocationService';
import {AppRequest} from 'models/AppRequest';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {
  saveDirectionQuestionnaire,
} from 'services/features/directionsQuestionnaire/directionQuestionnaireService';
import {generateRedisKey} from 'modules/draft-store/draftStoreService';

const specificCourtController = Router();
const viewPath = 'features/directionsQuestionnaire/hearing/specific-court';
const dqParentName = 'hearing';
const dqPropertyName = 'specificCourtLocation';
const renderView = async (form: GenericForm<SpecificCourtLocation>, req: Request, res: Response) => {
  const courtLocations = await getListOfCourtLocations(<AppRequest> req);
  res.render(viewPath, {form, courtLocations});
};

specificCourtController.get(DQ_COURT_LOCATION_URL, (async (req: Request, res: Response, next: NextFunction) =>{
  try{
    const form = new GenericForm<SpecificCourtLocation>(await getSpecificCourtLocationForm(generateRedisKey(<AppRequest>req)));
    await renderView(form, req, res);
  }catch(error){
    next(error);
  }
}) as RequestHandler)
  .post(DQ_COURT_LOCATION_URL, (async (req: Request, res: Response, next: NextFunction)=>{
    const claimId = req.params.id;
    try{
      const form = new GenericForm<SpecificCourtLocation>(SpecificCourtLocation.fromObject(req.body));
      form.validateSync();
      if(form.hasErrors()){
        await renderView(form, req, res);
      }else {
        await saveDirectionQuestionnaire(generateRedisKey(<AppRequest>req), form.model, dqPropertyName, dqParentName);
        res.redirect(constructResponseUrlWithIdParams(claimId, DQ_WELSH_LANGUAGE_URL));
      }
    }catch(error){
      next(error);
    }
  }) as RequestHandler);
export default specificCourtController;
