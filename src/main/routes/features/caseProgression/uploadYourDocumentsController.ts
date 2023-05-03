import {NextFunction, Router} from 'express';
import {UPLOAD_YOUR_DOCUMENTS_URL} from '../../urls';
import {TYPES_OF_DOCUMENTS_URL} from '../../urls';
import {AppRequest} from 'models/AppRequest';
import config from 'config';
import {CivilServiceClient} from 'client/civilServiceClient';
import {LatestUpdateSectionBuilder} from 'models/LatestUpdateSectionBuilder/latestUpdateSectionBuilder';
import {Claim} from 'models/claim';

const uploadYourDocumentsViewPath = 'features/caseProgression/upload-your-documents';
const uploadYourDocumentsController = Router();
const civilServiceApiBaseUrl = config.get<string>('services.civilService.url');
const civilServiceClient: CivilServiceClient = new CivilServiceClient(civilServiceApiBaseUrl);

function getUploadYourDocumentsContent(claimId: string, claim: Claim) {
  return new LatestUpdateSectionBuilder()
    .addTitle('PAGES.UPLOAD_YOUR_DOCUMENTS.TITLE')
    .addLeadParagraph('PAGES.UPLOAD_YOUR_DOCUMENTS.CASE_REFERENCE', {claimId: claimId})
    .addLeadParagraph('PAGES.UPLOAD_YOUR_DOCUMENTS.PARTIES', {
      claimantName: claim.getClaimantFullName(),
      defendantName: claim.getDefendantFullName(),
    })
    .addParagraph('PAGES.UPLOAD_YOUR_DOCUMENTS.CHECK_THE_ORDER')
    .addParagraph('PAGES.UPLOAD_YOUR_DOCUMENTS.YOU_CANNOT_WITHDRAW')
    .addParagraph('PAGES.UPLOAD_YOUR_DOCUMENTS.THE_OTHER_PARTIES')
    .addSubTitle('PAGES.UPLOAD_YOUR_DOCUMENTS.DEADLINES_FOR_UPLOADING')
    .addParagraph('PAGES.UPLOAD_YOUR_DOCUMENTS.CHECK_THE_ORDER_DEADLINES')
    .addLink('PAGES.UPLOAD_YOUR_DOCUMENTS.APPLY_TO_THE_COURT', 'TODO: apply to the court URL',
      'PAGES.UPLOAD_YOUR_DOCUMENTS.AFTER_THE_DEADLINE',
      'PAGES.UPLOAD_YOUR_DOCUMENTS.IF_YOU_WANT_ANY')
    .addParagraph('PAGES.UPLOAD_YOUR_DOCUMENTS.YOU_DO_NOT_HAVE')
    .addSubTitle('PAGES.UPLOAD_YOUR_DOCUMENTS.BEFORE_YOU_UPLOAD_YOUR')
    .addParagraph('PAGES.UPLOAD_YOUR_DOCUMENTS.BEFORE_YOU_UPLOAD_THE')
    .addParagraph('PAGES.UPLOAD_YOUR_DOCUMENTS.EACH_DOCUMENT_MUST')
    .addStartButton('PAGES.UPLOAD_YOUR_DOCUMENTS.START_NOW', TYPES_OF_DOCUMENTS_URL
      .replace(':id', claim.id))
    .build();
}

uploadYourDocumentsController.get([UPLOAD_YOUR_DOCUMENTS_URL], async (req, res, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    const claim = await civilServiceClient.retrieveClaimDetails(claimId, <AppRequest>req);
    if (claim && !claim.isEmpty()) {
      const latestUpdateSection = getUploadYourDocumentsContent(claimId, claim);
      res.render(uploadYourDocumentsViewPath, {latestUpdateSection});
    }
  } catch (error) {
    next(error);
  }

});

export default uploadYourDocumentsController;
