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
  // const courtLocations = await getListOfCourtLocations(<AppRequest> req);
  const courtLocations = [
    {
      code: '28b3277a-92f8-4e6b-a8b5-78c5de5c9a7a',
      label: "Barnet Civil and Family Centre - ST MARY'S COURT, REGENTS PARK ROAD - N3 1BQ"
    },
    {
      code: 'a50a3a8c-69bd-4ce5-aa2f-0b12cca5a85b',
      label: 'Central London County Court - THOMAS MORE BUILDING, ROYAL COURTS OF JUSTICE, STRAND, LONDON - WC2A 2LL'
    },
    {
      code: 'd0647ef5-b80b-4ac7-adc9-91879b7bd198',
      label: 'High Wycombe Law Courts - THE LAW COURTS, EASTON STREET - HP11 1LR'
    },
    {
      code: '50bf1014-c8c8-4bf8-be77-c8896db1e5b4',
      label: 'Liverpool Civil and Family Court - 35, VERNON STREET, CITY SQUARE - L2 2BX'
    },
    {
      code: '60c364bf-811d-4544-81f6-edbcfd902e29',
      label: 'site_name 0011 - court address 0011 - AA0 0BB'
    },
    {
      code: '8071b954-5057-4e56-a957-c05ba71042c1',
      label: 'site_name 0022 - court address 0022 - AA0 0BB'
    },
    {
      code: '830a23a9-3f56-42c3-a94e-43fe6d43c9ca',
      label: 'site_name 0101 - court address 0101 - AA0 0BB'
    },
    {
      code: 'aca78f86-a6c2-4fbd-955f-cec91cd74232',
      label: 'site_name 0202 - court address 0202 - AA0 0BB'
    },
    {
      code: 'd5098026-6da6-48fe-8510-afc549eae568',
      label: 'site_name 1122 - court address 1122 - AA0 0BB'
    },
    {
      code: '40ae27c6-ad9d-469b-8a0f-92d182023469',
      label: 'site_name 1133 - court address 1133 - AA0 0BB'
    },
    {
      code: '5f16eae9-0736-48f7-bbc7-ef0b70ef64f7',
      label: 'site_name 1212 - court address 1212 - AA0 0BB'
    },
    {
      code: '8ca5fa16-988f-4ed9-9605-24e002b8dd34',
      label: 'site_name 1313 - court address 1313 - AA0 0BB'
    },
    {
      code: '4369d499-9643-411d-acd7-920a6404321c',
      label: 'site_name 2233 - court address 2233 - AA0 0BB'
    },
    {
      code: 'b30815ab-e24a-4e73-9b1f-7f8e19c73797',
      label: 'site_name 2244 - court address 2244 - AA0 0BB'
    },
    {
      code: '4d82aecc-979c-4c34-a64d-334f880b8625',
      label: 'site_name 2323 - court address 2323 - AA0 0BB'
    },
    {
      code: '272991aa-2368-43c5-be13-022e0b82ee9a',
      label: 'site_name 2424 - court address 2424 - AA0 0BB'
    },
    {
      code: '3dd166ac-0e78-4169-b968-a0a686cd5dd3',
      label: 'site_name 3344 - court address 3344 - AA0 0BB'
    },
    {
      code: '3a9441f3-ddd4-41d5-be35-299e6338c913',
      label: 'site_name 3355 - court address 3355 - AA0 0BB'
    },
    {
      code: '1df00847-937c-457b-b5f2-a17d966e75d9',
      label: 'site_name 3434 - court address 3434 - AA0 0BB'
    },
    {
      code: '57346c5f-9779-4282-9a6d-d5464e699dd3',
      label: 'site_name 3535 - court address 3535 - AA0 0BB'
    },
    {
      code: 'f3400c6f-9241-4f37-abb5-8d203e576698',
      label: 'site_name 4444 - court address 4444 - AA0 0BB'
    },
    {
      code: 'e6cf1053-ee3d-4546-a511-02c33bb6f609',
      label: 'site_name 4455 - court address 4455 - AA0 0BB'
    },
    {
      code: '9ee970c1-93fc-48d8-9bae-81178aa7bfc6',
      label: 'site_name 4466 - court address 4466 - AA0 0BB'
    },
    {
      code: '302a2cbc-fd5c-478e-b3a3-a8ba7fbd6e8f',
      label: 'site_name 4545 - court address 4545 - AA0 0BB'
    },
    {
      code: 'ef07abb7-f1ae-4ed3-88fd-e29b06172f68',
      label: 'site_name 4646 - court address 4646 - AA0 0BB'
    },
    {
      code: '527d7aa5-5515-4353-8a9d-fd539662a4c0',
      label: 'site_name 5555 - court address 5555 - AA0 0BB'
    },
    {
      code: '848d7acb-c174-4fee-adeb-92307aae09ee',
      label: 'site_name 5566 - court address 5566 - AA0 0BB'
    },
    {
      code: 'bb3e62fd-e166-4245-87f2-9da3fed82a85',
      label: 'site_name 5577 - court address 5577 - AA0 0BB'
    },
    {
      code: 'aebf8008-b657-47e9-b91e-cceee58fa6d2',
      label: 'site_name 5656 - court address 5656 - AA0 0BB'
    },
    {
      code: 'f17f71ae-c72f-406a-b84d-7473db841204',
      label: 'site_name 5757 - court address 5757 - AA0 0BB'
    },
    {
      code: '57bac919-8799-40c6-8a9d-7754ca9bb7e0',
      label: 'site_name 6666 - court address 6666 - AA0 0BB'
    },
    {
      code: 'e6f3dd74-a202-42e7-846b-60dd058af939',
      label: 'site_name 6677 - court address 6677 - AA0 0BB'
    },
    {
      code: 'd84257ec-4995-44ba-b0a4-88ab1754e317',
      label: 'site_name 6688 - court address 6688 - AA0 0BB'
    },
    {
      code: '7fb390cc-fab8-4785-9bd1-811d1655a05d',
      label: 'site_name 6767 - court address 6767 - AA0 0BB'
    },
    {
      code: '8844be28-a278-4907-9713-e639a76e3453',
      label: 'site_name 6868 - court address 6868 - AA0 0BB'
    },
    {
      code: '1ac5a682-a651-4f93-943b-f7c2d35eb48b',
      label: 'site_name 7777 - court address 7777 - AA0 0BB'
    },
    {
      code: '9f951e72-f26c-4487-8e55-7aed4088a4de',
      label: 'site_name 7788 - court address 7788 - AA0 0BB'
    },
    {
      code: 'd3b98c62-286d-4754-9aae-2f87f314627b',
      label: 'site_name 7799 - court address 7799 - AA0 0BB'
    },
    {
      code: '98d8b140-86e7-424e-a26c-c3f3110046ee',
      label: 'site_name 7878 - court address 7878 - AA0 0BB'
    },
    {
      code: 'e30e0980-9abd-4ff7-921e-ead81030ef19',
      label: 'site_name 7979 - court address 7979 - AA0 0BB'
    },
    {
      code: '9e0f3383-480c-47f0-8acc-7fe197bac7da',
      label: 'site_name 8080 - court address 8080 - AA0 0BB'
    },
    {
      code: '2c18a9df-00e3-41b9-ad6b-189483dc9a92',
      label: 'site_name 8800 - court address 8800 - AA0 0BB'
    },
    {
      code: 'eb148195-6318-4b35-8b60-7efb787ce3e5',
      label: 'site_name 8888 - court address 8888 - AA0 0BB'
    },
    {
      code: '49c01ca2-9d69-416a-a17b-f9ab9baeca92',
      label: 'site_name 8899 - court address 8899 - AA0 0BB'
    },
    {
      code: 'bb8efdfa-3469-46d5-afd5-1a4c59d15da0',
      label: 'site_name 8989 - court address 8989 - AA0 0BB'
    },
    {
      code: '159159df-e9a1-41e3-a806-4c90c6d645cf',
      label: 'site_name 9090 - court address 9090 - AA0 0BB'
    },
    {
      code: 'e1281632-6e4d-4c47-a90b-1467686cb82f',
      label: 'site_name 9191 - court address 9191 - AA0 0BB'
    },
    {
      code: '0004c5a2-c6f9-46f8-824c-2e4965ac2498',
      label: 'site_name 9900 - court address 9900 - AA0 0BB'
    },
    {
      code: 'd8f82a2f-b2bd-41e6-93a5-afc33f47b05c',
      label: 'site_name 9911 - court address 9911 - AA0 0BB'
    },
    {
      code: 'f23df31e-2f15-4f85-a09d-89bb58803964',
      label: 'site_name 9999 - court address 9999 - AA0 0BB'
    },
  ];
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
