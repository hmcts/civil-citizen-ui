import {NextFunction, Request, Response, Router} from 'express';
import {DQ_COURT_LOCATION_URL, DQ_WELSH_LANGUAGE_URL} from '../../../urls';
import {SpecificCourtLocation} from 'models/directionsQuestionnaire/hearing/specificCourtLocation';
import {GenericForm} from 'common/form/models/genericForm';

import {
  // getListOfCourtLocations,
  getSpecificCourtLocationForm,
} from '../../../../services/features/directionsQuestionnaire/hearing/specificCourtLocationService';
// import {AppRequest} from 'models/AppRequest';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {
  saveDirectionQuestionnaire,
} from '../../../../services/features/directionsQuestionnaire/directionQuestionnaireService';

const specificCourtController = Router();
const viewPath = 'features/directionsQuestionnaire/hearing/specific-court';
const dqParentName = 'hearing';
const dqPropertyName = 'specificCourtLocation';
const renderView = async (form: GenericForm<SpecificCourtLocation>, req: Request, res: Response) => {
  const courtLocations = [
    {
      code: '28b3277a-92f8-4e6b-a8b5-78c5de5c9a7a',
      label: "Barnet Civil and Family Centre - ST MARY'S COURT, REGENTS PARK ROAD - N3 1BQ",
    },
    {
      code: 'a50a3a8c-69bd-4ce5-aa2f-0b12cca5a85b',
      label: 'Central London County Court - THOMAS MORE BUILDING, ROYAL COURTS OF JUSTICE, STRAND, LONDON - WC2A 2LL',
    },
    {
      code: 'd0647ef5-b80b-4ac7-adc9-91879b7bd198',
      label: 'High Wycombe Law Courts - THE LAW COURTS, EASTON STREET - HP11 1LR',
    },
    {
      code: '50bf1014-c8c8-4bf8-be77-c8896db1e5b4',
      label: 'Liverpool Civil and Family Court - 35, VERNON STREET, CITY SQUARE - L2 2BX',
    }];
  res.render(viewPath, {form, courtLocations});
};

specificCourtController.get(DQ_COURT_LOCATION_URL, async (req: Request, res: Response, next: NextFunction) =>{
  try{
    const form = new GenericForm<SpecificCourtLocation>(await getSpecificCourtLocationForm(req.params.id));
    await renderView(form, req, res);
  }catch(error){
    next(error);
  }
})
  .post(DQ_COURT_LOCATION_URL, async (req: Request, res: Response, next: NextFunction)=>{
    const claimId = req.params.id;
    try{
      const form = new GenericForm<SpecificCourtLocation>(SpecificCourtLocation.fromObject(req.body));
      form.validateSync();
      if(form.hasErrors()){
        await renderView(form, req, res);
      }else {
        await saveDirectionQuestionnaire(claimId, form.model, dqPropertyName, dqParentName);
        res.redirect(constructResponseUrlWithIdParams(claimId, DQ_WELSH_LANGUAGE_URL));
      }
    }catch(error){
      next(error);
    }
  });
export default specificCourtController;
