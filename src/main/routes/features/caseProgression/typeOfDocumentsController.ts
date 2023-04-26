import {NextFunction, Request, Response, Router} from 'express';
import { TYPES_OF_DOCUMENTS_URL} from '../../urls';

import {AppRequest} from 'common/models/AppRequest';

import {GenericForm} from 'common/form/models/genericForm';
import {Hint, TypeOfDocumentsItems} from 'form/models/caseProgression/typeOfDocuments';
import {SectionTypeOfDocuments} from 'form/models/caseProgression/sectionTypeOfDocuments';
import {t} from 'i18next';

import {getCaseDataFromStore} from 'modules/draft-store/draftStoreService';

const typeOfDocumentsViewPath = 'features/caseProgression/typeOfDocuments';
const typeOfDocumentsController = Router();

function renderView(res: Response, form: GenericForm<SectionTypeOfDocuments[]>, claimId: string, claimantFullName: string, defendantFullName: string) {

  res.render(typeOfDocumentsViewPath, {
    form,claimId,claimantFullName,defendantFullName,
  });
}

typeOfDocumentsController.get(TYPES_OF_DOCUMENTS_URL,
  async (req: AppRequest, res: Response, next: NextFunction) => {
    try {

      const claimId = req.params.id;
      const claim = await getCaseDataFromStore(req.params.id);
      const claimantFullName = claim.getClaimantFullName();
      const defendantFullName = claim.getDefendantFullName();
      const disclosureItems = [];
      disclosureItems.push(new TypeOfDocumentsItems('disclosure1', t('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.DOCUMENTS_FOR_DISCLOSURE'), new Hint(t('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.DOCUMENTS_FOR_DISCLOSURE_HINT'))));
      disclosureItems.push(new TypeOfDocumentsItems('disclosure2', t('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.DISCLOSURE_LIST'), new Hint(t('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.DISCLOSURE_LIST_HINT'))));
      const witnessItems = [];
      witnessItems.push(new TypeOfDocumentsItems('witness statement', t('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.YOUR_STATEMENT'), new Hint(t('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.YOUR_STATEMENT_HINT'))));
      witnessItems.push(new TypeOfDocumentsItems('witness section 2', t('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.WITNESS_STATEMENT'), new Hint(t('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.WITNESS_STATEMENT_HINT'))));
      witnessItems.push(new TypeOfDocumentsItems('witness section 3', t('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.WITNESS_SUMMARY'), new Hint(t('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.WITNESS_SUMMARY_HINT'))));
      witnessItems.push(new TypeOfDocumentsItems('witness section 4', t('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.NOTICE_OF_INTENTION'), new Hint(t('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.NOTICE_OF_INTENTION_HINT'))));
      witnessItems.push(new TypeOfDocumentsItems('witness section 4', t('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.DOCUMENTS_REFFERED_TO_STATEMENT'), new Hint(t('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.DOCUMENTS_REFFERED_TO_STATEMENT_HINT'))));
      const expertItems = [];
      expertItems.push(new TypeOfDocumentsItems('expert evidence 1', t('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.EXPERTS_REPORT'), new Hint(t('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.EXPERTS_REPORT_HINT'))));
      expertItems.push(new TypeOfDocumentsItems('expert evidence 2', t('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.JOINT_STATEMENT_OF_EXPERTS'), new Hint(t('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.JOINT_STATEMENT_OF_EXPERTS_HINT'))));
      expertItems.push(new TypeOfDocumentsItems('expert evidence 1', t('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.QUESTIONS_FOR_OTHER_PARTY'), new Hint(t('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.QUESTIONS_FOR_OTHER_PARTY_HINT'))));
      expertItems.push(new TypeOfDocumentsItems('expert evidence 2', t('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.ANSWERS_TO_QUESTIONS'), new Hint(t('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.ANSWERS_TO_QUESTIONS_HINT'))));
      const trialItems = [];
      trialItems.push(new TypeOfDocumentsItems('expert evidence 1', t('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.CASE_SUMMARY'), new Hint(t('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.CASE_SUMMARY_HINT'))));
      trialItems.push(new TypeOfDocumentsItems('expert evidence 1', t('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.SKELETON_ARGUMENT'), new Hint(t('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.SKELETON_ARGUMENT_HINT'))));
      trialItems.push(new TypeOfDocumentsItems('expert evidence 2', t('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.LEGAL_AUTHORITIES'), new Hint(t('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.LEGAL_AUTHORITIES_HINT'))));
      trialItems.push(new TypeOfDocumentsItems('expert evidence 2', t('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.COSTS'), new Hint(t('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.COSTS_HINT'))));
      trialItems.push(new TypeOfDocumentsItems('expert evidence 1', t('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.DOCUMENTARY_EVIDENCE'), new Hint(t('PAGES.UPLOAD_EVIDENCE_DOCUMENTS.DOCUMENTARY_EVIDENCE_HINT'))));
      const arrayOfSection = [];
      arrayOfSection.push(new SectionTypeOfDocuments('Disclosure', disclosureItems));
      arrayOfSection.push(new SectionTypeOfDocuments('Witness evidence', witnessItems));
      arrayOfSection.push(new SectionTypeOfDocuments('Expert evidence', expertItems));
      arrayOfSection.push(new SectionTypeOfDocuments('Trial documents', trialItems));

      const form = new GenericForm(arrayOfSection);
      renderView(res, form, claimId, claimantFullName, defendantFullName);
    } catch (error) {
      next(error);
    }
  });

typeOfDocumentsController.post(TYPES_OF_DOCUMENTS_URL, async (req: Request | AppRequest, res: Response, next: NextFunction) => {
  try {
   /* empty method */
  } catch (error) {
    next(error);
  }
});

export default typeOfDocumentsController;
