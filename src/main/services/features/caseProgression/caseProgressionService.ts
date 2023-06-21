import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {
  UploadDocuments,
  UploadDocumentTypes,
} from 'models/caseProgression/uploadDocumentsType';
import {ClaimantOrDefendant} from 'models/partyType';
import {CaseProgression} from 'common/models/caseProgression/caseProgression';
import {Request} from 'express';
import {
  EvidenceUploadDisclosure,
  EvidenceUploadExpert,
  EvidenceUploadTrial,
  EvidenceUploadWitness,
} from 'models/document/documentType';
import {
  UploadDocumentsUserForm,

} from 'models/caseProgression/uploadDocumentsUserForm';
import {TypeOfDocumentSectionMapper} from 'services/features/caseProgression/TypeOfDocumentSectionMapper';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('supportRequiredService');

export const getDocuments = async (claimId: string,claimantOrDefendant: ClaimantOrDefendant): Promise<UploadDocuments> => {
  try {
    const caseData = await getCaseDataFromStore(claimId);
    if (caseData?.caseProgression?.defendantUploadDocuments && claimantOrDefendant===ClaimantOrDefendant.DEFENDANT) {
      return caseData?.caseProgression?.defendantUploadDocuments ? caseData?.caseProgression.defendantUploadDocuments : new UploadDocuments();
    }
    else if (caseData?.caseProgression?.claimantUploadDocuments && claimantOrDefendant===ClaimantOrDefendant.CLAIMANT) {
      return caseData?.caseProgression?.claimantUploadDocuments ? caseData?.caseProgression.claimantUploadDocuments : new UploadDocuments();
    }
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
export const saveCaseProgression = async (claimId: string, value: any, caseProgressionPropertyName: string, parentPropertyName?: string): Promise<void> => {
  try {
    const claim: any = await getCaseDataFromStore(claimId);

    if (!claim.caseProgression) {
      claim.caseProgression = new CaseProgression();
    }
    if (claim?.caseProgression) {
      if (parentPropertyName && claim.caseProgression[parentPropertyName]) {
        claim.caseProgression[parentPropertyName][caseProgressionPropertyName] = value;
      } else if (parentPropertyName && !claim.caseProgression[parentPropertyName]) {
        claim.caseProgression[parentPropertyName] = {[caseProgressionPropertyName]: value};
      } else {
        claim.caseProgression[caseProgressionPropertyName] = value;
      }
    } else {
      const caseProgression: any = new CaseProgression();
      if (parentPropertyName) {
        caseProgression[parentPropertyName] = {[caseProgressionPropertyName]: value};
      } else {
        caseProgression[caseProgressionPropertyName] = value;
      }
      claim.caseProgression = caseProgression;
    }
    await saveDraftClaim(claimId, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
export const getTypeDocumentForm = (req: Request): UploadDocuments => {
  const documents = new UploadDocumentTypes(!!req.body.documents,undefined,EvidenceUploadDisclosure.DOCUMENTS_FOR_DISCLOSURE);
  const list = new UploadDocumentTypes(!!req.body.list,undefined,EvidenceUploadDisclosure.DISCLOSURE_LIST);
  const disclosure = [];
  disclosure.push(documents);
  disclosure.push(list);
  const yourStatement = new UploadDocumentTypes(!!req.body.yourStatement,undefined,EvidenceUploadWitness.YOUR_STATEMENT);
  const witnessStatement = new UploadDocumentTypes(!!req.body.witnessStatement,undefined,EvidenceUploadWitness.WITNESS_STATEMENT);
  const summary = new UploadDocumentTypes(!!req.body.summary,undefined,EvidenceUploadWitness.WITNESS_SUMMARY);
  const witnessNotice = new UploadDocumentTypes(!!req.body.witnessNotice,undefined,EvidenceUploadWitness.NOTICE_OF_INTENTION);
  const witnessDocuments = new UploadDocumentTypes(!!req.body.witnessDocuments,undefined,EvidenceUploadWitness.DOCUMENTS_REFERRED);
  const witness = [];
  witness.push(yourStatement);
  witness.push(witnessStatement);
  witness.push(summary);
  witness.push(witnessNotice);
  witness.push(witnessDocuments);

  const report = new UploadDocumentTypes(!!req.body.report,undefined,EvidenceUploadExpert.EXPERT_REPORT);
  const statement = new UploadDocumentTypes(!!req.body.statement,undefined,EvidenceUploadExpert.STATEMENT);
  const questions = new UploadDocumentTypes(!!req.body.questions,undefined,EvidenceUploadExpert.QUESTIONS_FOR_EXPERTS);
  const answer = new UploadDocumentTypes(!!req.body.answer,undefined,EvidenceUploadExpert.ANSWERS_FOR_EXPERTS);
  const expert = [];
  expert.push(report);
  expert.push(statement);
  expert.push(questions);
  expert.push(answer);

  const case_summary = new UploadDocumentTypes(!!req.body.case,undefined,EvidenceUploadTrial.CASE_SUMMARY);
  const skeleton = new UploadDocumentTypes(!!req.body.skeleton,undefined,EvidenceUploadTrial.SKELETON_ARGUMENT);
  const legal = new UploadDocumentTypes(!!req.body.legal,undefined,EvidenceUploadTrial.AUTHORITIES);
  const cost = new UploadDocumentTypes(!!req.body.cost,undefined,EvidenceUploadTrial.COSTS);
  const documentary = new UploadDocumentTypes(!!req.body.documentary,undefined,EvidenceUploadTrial.DOCUMENTARY);
  const trial = [];
  trial.push(case_summary);
  trial.push(skeleton);
  trial.push(legal);
  trial.push(cost);
  trial.push(documentary);

  const typeDocumentList = new UploadDocuments(disclosure,witness,expert,trial);
  return typeDocumentList;
};

export const getUploadDocumentsForm = (req: Request): UploadDocumentsUserForm => {
  const documentsForDisclosure = TypeOfDocumentSectionMapper.mapToTypeOfDocumentSections(req.body.documentsForDisclosure, req);
  const documentsList = TypeOfDocumentSectionMapper.mapToTypeOfDocumentSections(req.body.disclosureList, req);
  const trialCaseSummary = TypeOfDocumentSectionMapper.mapToTypeOfDocumentSections(req.body.trialCaseSummary, req);
  const trialSkeletonArgument = TypeOfDocumentSectionMapper.mapToTypeOfDocumentSections(req.body.trialSkeletonArgument, req);
  const trialAuthorities = TypeOfDocumentSectionMapper.mapToTypeOfDocumentSections(req.body.trialAuthorities, req);
  const trialCosts = TypeOfDocumentSectionMapper.mapToTypeOfDocumentSections(req.body.trialCosts, req);
  const trialDocumentary = TypeOfDocumentSectionMapper.mapToTypeOfDocumentSections(req.body.trialDocumentary, req);

  return new UploadDocumentsUserForm(
    documentsForDisclosure,
    documentsList,
    trialCaseSummary,
    trialSkeletonArgument,
    trialAuthorities,
    trialCosts,
    trialDocumentary,
  );
};

/*const getFormSection = <T>(data: any[]): T[] => {
  const formSection: T[] = [];
  data?.forEach(function (request: any) {
    //const fileName = `[${index}][fileUpload]`;
    //const className = bindFunction(request).constructor.name;
    //const fileName = `${className}[${index}][fileUpload]`;
    formSection.push(request);
  });
  return formSection;
};

const documentsForDisclosure: TypeOfDocumentSection[] = req.body.documentsForDisclosure.map((item: any) => {
  const typeOfDocument: string = item.typeOfDocument.trim();
  const dateDay: string = item['date-day'];
  const dateMonth: string = item['date-month'];
  const dateYear: string = item['date-year'];

  return new TypeOfDocumentSection(fileUpload, typeOfDocument, dateDay, dateMonth, dateYear);
});

const bindRequestToTypeOfDocumentSectionObj = (request: any): TypeOfDocumentSection => {
  const formObj: TypeOfDocumentSection = new TypeOfDocumentSection();
  formObj.typeOfDocument = request['typeOfDocument'].trim();
  formObj.dateDay = request['date-day'];
  formObj.dateMonth = request['date-month'];
  formObj.dateYear = request['date-year'];
  //formObj.fileUpload = getUploadDocumentsByName(fileName, req);
  return formObj;
};

const bindRequestToFileOnlySectionObj = (request: any): FileSection => {
  const formObj: FileSection = new FileSection();
  //formObj.fileUpload = getUploadDocumentsByName(fileName, req);
  return formObj;
};*/
