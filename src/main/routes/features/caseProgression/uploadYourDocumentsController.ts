import {NextFunction, Router} from 'express';
import {UPLOAD_YOUR_DOCUMENTS_URL} from '../../urls';
import {AppRequest} from 'models/AppRequest';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {LatestUpdateSectionBuilder} from 'models/LatestUpdateSectionBuilder/latestUpdateSectionBuilder';

const uploadYourDocumentsViewPath = 'features/caseProgression/upload-your-documents';
const uploadYourDocumentsController = Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

uploadYourDocumentsController.get([UPLOAD_YOUR_DOCUMENTS_URL], async (req, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await civilServiceClient.retrieveClaimDetails(claimId, <AppRequest>req);
    if (claim && !claim.isEmpty()) {
      // const latestUpdateContent = getLatestUpdateContent(claimId, claim);
      // console.log(latestUpdateContent.length);
      // const documentsContent = getDocumentsContent(claim, claimId);
      const latestUpdateSection = new LatestUpdateSectionBuilder()
        .addTitle('PAGES.UPLOAD_YOUR_DOCUMENTS.TITLE')
        .addParagraph('Case reference: ' + claimId)
        .addParagraph(claim.getClaimantFullName() + ' v ' + claim.getDefendantFullName())
        .addParagraph('case reference :' , {claimId: '1212121'})
        .addParagraph('jnh smith y jane doe')
        .addLink('textTest', 'hrefTest', 'textBeforeTest','textAfterTest')
        .addParagraph('check the order.....')
        .addParagraph('check the order.....')
        .addStartButton('start now', 'TODO: link to Nagas page')
        .build();

      res.render(uploadYourDocumentsViewPath, {latestUpdateSection});
    }
  } catch (error) {
    next(error);
  }

});

export default uploadYourDocumentsController;
