import {NextFunction, Request, Response, Router} from 'express';
import {DQ_COURT_LOCATION_URL, DQ_WELSH_LANGUAGE_URL} from '../../../urls';
import {SpecificCourtLocation} from 'models/directionsQuestionnaire/hearing/specificCourtLocation';
import {GenericForm} from 'common/form/models/genericForm';
import {CourtLocation} from 'models/courts/courtLocations';
import {
  getListOfCourtLocations,
  getSpecificCourtLocationForm,
} from '../../../../services/features/directionsQuestionnaire/hearing/specificCourtLocationService';
import {AppRequest} from 'models/AppRequest';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';

const specificCourtController = Router();
const viewPath = 'features/directionsQuestionnaire/hearing/specific-court';

const renderView = (form: GenericForm<SpecificCourtLocation>, courtLocations: CourtLocation[], res: Response) => {
  res.render(viewPath, {form, courtLocations});
};

specificCourtController.get(DQ_COURT_LOCATION_URL, async (req: Request, res: Response, next: NextFunction) =>{
  try{
    const form = new GenericForm<SpecificCourtLocation>(await getSpecificCourtLocationForm(req.params.id));
    const courtLocations = await getListOfCourtLocations(<AppRequest> req);
    renderView(form, courtLocations, res);
  }catch(error){
    next(error);
  }
})
  .post(DQ_COURT_LOCATION_URL, async (req: Request, res: Response, next: NextFunction)=>{
    const claimId = req.params.id;
    res.redirect(constructResponseUrlWithIdParams(claimId, DQ_WELSH_LANGUAGE_URL));
  });
export default specificCourtController;
