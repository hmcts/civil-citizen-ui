import {NextFunction, Response, RequestHandler, Router} from 'express';
import {
  COSC_UPLOAD_DOCUMENTS_URL,
  CP_CHECK_ANSWERS_URL,
  CP_EVIDENCE_UPLOAD_CANCEL,
  TYPES_OF_DOCUMENTS_URL,
} from '../../urls';
import {Claim} from 'models/claim';
import {getWitnessContent} from 'services/features/caseProgression/witnessService';
import {
  getDisclosureContent,
} from 'services/features/caseProgression/disclosureService';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {GenericForm} from 'form/models/genericForm';
import {getUploadDocumentsForm, saveCaseProgression} from 'services/features/caseProgression/caseProgressionService';
import {UploadDocumentsUserForm} from 'models/caseProgression/uploadDocumentsUserForm';
import {getTrialContent} from 'services/features/caseProgression/trialService';
import {getExpertContent} from 'services/features/caseProgression/expertService';
import {AppRequest} from 'common/models/AppRequest';
import {getClaimById} from 'modules/utilityService';
import {PageSectionBuilder} from 'common/utils/pageSectionBuilder';

const uploadDocumentsViewPath = 'features/certOfSorC/upload-documents-cosc';
const uploadDocumentsCoSCController = Router();
const dqPropertyName = 'defendantDocuments';
const dqPropertyNameClaimant = 'claimantDocuments';

const getBasicDocumentsContents = () => {
  return new PageSectionBuilder()
    .addMicroText('PAGES.UPLOAD_DOCUMENTS_COSC.CONFIRM')
    .addMainTitle('PAGES.UPLOAD_DOCUMENTS_COSC.TITLE')
    .addTitle('PAGES.UPLOAD_DOCUMENTS_COSC.SUB_TITLE')
    .addParagraph('PAGES.UPLOAD_DOCUMENTS_COSC.GIVE_YOUR')
    .build();
};

async function renderView(res: Response, claim: Claim, claimId: string, form: GenericForm<UploadDocumentsUserForm> = null) {
  const cancelUrl = constructResponseUrlWithIdParams(claimId, CP_EVIDENCE_UPLOAD_CANCEL);
  const isSmallClaims = claim.isSmallClaimsTrackDQ;

  if(!claim.isClaimant() && !form && claim.caseProgression?.defendantDocuments)
  {
    form = new GenericForm(claim.caseProgression?.defendantDocuments);
  } else if (claim.isClaimant() && !form && claim.caseProgression?.claimantDocuments) {
    form = new GenericForm(claim.caseProgression?.claimantDocuments);
  }

  if (claim && !claim.isEmpty()) {
    const disclosureContent = getDisclosureContent(claim, form);
    const witnessContent = getWitnessContent(claim, form);
    const expertContent = getExpertContent(claim, form);
    const trialContent = getTrialContent(claim, form, isSmallClaims);
    const uploadDocumentsContents= getBasicDocumentsContents();
    const backLinkUrl = constructResponseUrlWithIdParams(claimId, TYPES_OF_DOCUMENTS_URL);
    res.render(uploadDocumentsViewPath, {
      form,
      claim,
      claimId,
      disclosureContent,
      witnessContent,
      expertContent,
      trialContent,
      cancelUrl,
      isSmallClaims,
      uploadDocumentsContents,
      backLinkUrl,
    });
  }
}

uploadDocumentsCoSCController.get(COSC_UPLOAD_DOCUMENTS_URL, (async (req: AppRequest, res: Response, next: NextFunction) => {
  try {
    const claimId = req.params.id;
    req.session.previousUrl = req.originalUrl;
    const claim: Claim = await getClaimById(claimId, req, true);
    await renderView(res, claim, claimId, null);
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

uploadDocumentsCoSCController.post(COSC_UPLOAD_DOCUMENTS_URL, (async (req, res, next) => {
  try {
    const claimId = req.params.id;
    const claim: Claim = await getClaimById(claimId, req, true);
    const uploadDocumentsForm = getUploadDocumentsForm(req);
    const form = new GenericForm(uploadDocumentsForm);
    const isClaimant = claim.isClaimant() ? dqPropertyNameClaimant : dqPropertyName;

    form.validateSync();
    if (form.hasErrors()) {
      await renderView(res, claim, claimId, form);
    } else {
      await saveCaseProgression(req,form.model, isClaimant);
      res.redirect(constructResponseUrlWithIdParams(claimId, CP_CHECK_ANSWERS_URL));
    }
  } catch (error) {
    next(error);
  }
}) as RequestHandler);

export default uploadDocumentsCoSCController;
