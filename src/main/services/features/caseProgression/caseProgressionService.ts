import {generateRedisKey, getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {UploadDocuments, UploadDocumentTypes} from 'models/caseProgression/uploadDocumentsType';
import {CaseProgression} from 'common/models/caseProgression/caseProgression';
import {Request} from 'express';
import {
  EvidenceUploadDisclosure,
  EvidenceUploadExpert,
  EvidenceUploadTrial,
  EvidenceUploadWitness,
} from 'models/document/documentType';
import {
  ExpertSection,
  FileOnlySection, ReferredToInTheStatementSection,
  TypeOfDocumentSection,
  UploadDocumentsUserForm,
  WitnessSection, WitnessSummarySection,
} from 'models/caseProgression/uploadDocumentsUserForm';
import {TrialArrangements} from 'models/caseProgression/trialArrangements/trialArrangements';
import {CaseDocument} from 'models/document/caseDocument';
import {Claim} from 'models/claim';
import {GenericYesNo} from 'form/models/genericYesNo';
import {FeeType} from 'form/models/helpWithFees/feeType';
import {AppRequest} from 'models/AppRequest';
import {getClaimById} from 'modules/utilityService';
import { isCUIReleaseTwoEnabled } from 'app/auth/launchdarkly/launchDarklyClient';
import { constructResponseUrlWithIdParams } from 'common/utils/urlFormatter';
import { DASHBOARD_CLAIMANT_URL, DEFENDANT_SUMMARY_URL, OLD_DASHBOARD_CLAIMANT_URL } from 'routes/urls';

const {Logger} = require('@hmcts/nodejs-logging');
const logger = Logger.getLogger('supportRequiredService');

export const getDocuments = async (redisKey: string): Promise<UploadDocuments> => {
  try {
    const caseData = await getCaseDataFromStore(redisKey);
    if (caseData?.caseProgression?.defendantUploadDocuments && !caseData.isClaimant()) {
      return caseData?.caseProgression?.defendantUploadDocuments ? caseData?.caseProgression.defendantUploadDocuments : new UploadDocuments();
    }
    else if (caseData?.caseProgression?.claimantUploadDocuments && caseData.isClaimant()) {
      return caseData?.caseProgression?.claimantUploadDocuments ? caseData?.caseProgression.claimantUploadDocuments : new UploadDocuments();
    }
  } catch (error) {
    logger.error(error);
    throw error;
  }
};
export const saveCaseProgression = async (req: Request,value: any, caseProgressionPropertyName: string, parentPropertyName?: string): Promise<void> => {
  try {
    const redisKey = generateRedisKey(<AppRequest>req);
    const claim: any = await getCaseDataFromStore(redisKey);

    if (!claim.caseProgression) {
      claim.caseProgression = new CaseProgression();
    }

    if(parentPropertyName == 'defendantTrialArrangements' && !claim?.caseProgression.defendantTrialArrangements)
    {
      claim.caseProgression.defendantTrialArrangements = new TrialArrangements();
    } else if (parentPropertyName == 'claimantTrialArrangements' && !claim?.caseProgression.claimantTrialArrangements) {
      claim.caseProgression.claimantTrialArrangements = new TrialArrangements();
    }

    if(caseProgressionPropertyName == 'hearingFeeHelpSelection')
    {
      if (!claim.caseProgression.hearingFeeHelpSelection) {
        claim.caseProgression.hearingFeeHelpSelection = new GenericYesNo();
      }
      claim.feeTypeHelpRequested = FeeType.HEARING;
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
    await saveDraftClaim(redisKey, claim);
  } catch (error) {
    logger.error(error);
    throw error;
  }
};

export const deleteUntickedDocumentsFromStore = async (req: Request, isClaimant: boolean) => {
  const claim: Claim = await getClaimById(req.params.id, req, true);
  let documentsTicked: UploadDocuments;
  let documentsSaved: UploadDocumentsUserForm;
  let propertyName: string;
  const documentsToSave: UploadDocumentsUserForm = new UploadDocumentsUserForm();

  if(!isClaimant){
    documentsTicked = claim.caseProgression.defendantUploadDocuments;
    documentsSaved = claim.caseProgression.defendantDocuments;
    propertyName = 'defendantDocuments';
  } else {
    documentsTicked = claim.caseProgression.claimantUploadDocuments;
    documentsSaved = claim.caseProgression.claimantDocuments;
    propertyName = 'claimantDocuments';
  }

  if(documentsSaved)
  {
    documentsToSave.documentsForDisclosure = documentsTicked.disclosure[0].selected ? documentsSaved.documentsForDisclosure : [];
    documentsToSave.disclosureList = documentsTicked.disclosure[1].selected ? documentsSaved.disclosureList : [];

    documentsToSave.witnessStatement = documentsTicked.witness[0].selected ? documentsSaved.witnessStatement : [];
    documentsToSave.witnessSummary = documentsTicked.witness[1].selected ? documentsSaved.witnessSummary : [];
    documentsToSave.noticeOfIntention = documentsTicked.witness[2].selected ? documentsSaved.noticeOfIntention : [];
    documentsToSave.documentsReferred = documentsTicked.witness[3].selected ? documentsSaved.documentsReferred : [];

    documentsToSave.expertReport = documentsTicked.expert[0].selected ? documentsSaved.expertReport : [];
    documentsToSave.expertStatement = documentsTicked.expert[1].selected ? documentsSaved.expertStatement : [];
    documentsToSave.questionsForExperts = documentsTicked.expert[2].selected ? documentsSaved.questionsForExperts : [];
    documentsToSave.answersForExperts = documentsTicked.expert[3].selected ? documentsSaved.answersForExperts : [];

    documentsToSave.trialCaseSummary = documentsTicked.trial[0].selected ? documentsSaved.trialCaseSummary : [];
    documentsToSave.trialSkeletonArgument = documentsTicked.trial[1].selected ? documentsSaved.trialSkeletonArgument : [];
    documentsToSave.trialAuthorities = documentsTicked.trial[2].selected ? documentsSaved.trialAuthorities : [];
    documentsToSave.trialCosts = documentsTicked.trial[3].selected ? documentsSaved.trialCosts : [];
    documentsToSave.trialDocumentary = documentsTicked.trial[4].selected ? documentsSaved.trialDocumentary : [];

    await saveCaseProgression(req, documentsToSave, propertyName);
  }
};

export const getTypeDocumentForm = (req: Request): UploadDocuments => {
  const documents = new UploadDocumentTypes(!!req.body.documents,undefined,EvidenceUploadDisclosure.DOCUMENTS_FOR_DISCLOSURE);
  const list = new UploadDocumentTypes(!!req.body.list,undefined,EvidenceUploadDisclosure.DISCLOSURE_LIST);
  const disclosure = [];
  disclosure.push(documents);
  disclosure.push(list);
  const witnessStatement = new UploadDocumentTypes(!!req.body.witnessStatement,undefined,EvidenceUploadWitness.WITNESS_STATEMENT);
  const summary = new UploadDocumentTypes(!!req.body.summary,undefined,EvidenceUploadWitness.WITNESS_SUMMARY);
  const witnessNotice = new UploadDocumentTypes(!!req.body.witnessNotice,undefined,EvidenceUploadWitness.NOTICE_OF_INTENTION);
  const witnessDocuments = new UploadDocumentTypes(!!req.body.witnessDocuments,undefined,EvidenceUploadWitness.DOCUMENTS_REFERRED);
  const witness = [];
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
  const documentsForDisclosure = getFormSection<TypeOfDocumentSection>(req.body.documentsForDisclosure, bindRequestToTypeOfDocumentSectionObj);
  const documentsList = getFormSection<FileOnlySection>(req.body.disclosureList, bindRequestToFileOnlySectionObj);

  const witnessStatement = getFormSection<WitnessSection>(req.body.witnessStatement, bindRequestToWitnessSectionObj);
  const witnessSummary = getFormSection<WitnessSummarySection>(req.body.witnessSummary, bindRequestToWitnessSummarySectionObj);
  const noticeOfIntention = getFormSection<WitnessSection>(req.body.noticeOfIntention, bindRequestToWitnessSectionObj);
  const documentsReferred = getFormSection<ReferredToInTheStatementSection>(req.body.documentsReferred, bindRequestToReferredToInTheStatementSectionObj);

  const expertReport = getFormSection<ExpertSection>(req.body.expertReport, bindRequestToExpertSectionObj);
  const expertStatement = getFormSection<ExpertSection>(req.body.expertStatement, bindRequestToExpertSectionObj);
  const questionsForExperts = getFormSection<ExpertSection>(req.body.questionsForExperts, bindRequestToExpertSectionObj);
  const answersForExperts = getFormSection<ExpertSection>(req.body.answersForExperts, bindRequestToExpertSectionObj);

  const trialCaseSummary = getFormSection<FileOnlySection>(req.body.trialCaseSummary, bindRequestToFileOnlySectionObj);
  const trialSkeletonArgument = getFormSection<FileOnlySection>(req.body.trialSkeletonArgument, bindRequestToFileOnlySectionObj);
  const trialAuthorities = getFormSection<FileOnlySection>(req.body.trialAuthorities, bindRequestToFileOnlySectionObj);
  const trialCosts = getFormSection<FileOnlySection>(req.body.trialCosts, bindRequestToFileOnlySectionObj);
  const trialDocumentary = getFormSection<TypeOfDocumentSection>(req.body.trialDocumentary, bindRequestToTypeOfDocumentSectionObj);

  return new UploadDocumentsUserForm(
    documentsForDisclosure,
    documentsList,
    witnessStatement,
    witnessSummary,
    noticeOfIntention,
    documentsReferred,
    expertReport,
    expertStatement,
    questionsForExperts,
    answersForExperts,
    trialCaseSummary,
    trialSkeletonArgument,
    trialAuthorities,
    trialCosts,
    trialDocumentary,
  );
};

const getFormSection = <T>(data: [], bindFunction: (request: unknown) => T): T[] => {
  const formSection: T[] = [];
  if (Array.isArray(data)) {
    data?.forEach(function (request: unknown) {
      formSection.push(bindFunction(request));
    });
  } else {
    logger.error('Invalid form section, Single value:',  data);
  }
  return formSection;
};

const bindRequestToTypeOfDocumentSectionObj = (request: any): TypeOfDocumentSection => {
  const formObj = createSectionWithDate(TypeOfDocumentSection, request);
  formObj.typeOfDocument = toNonEmptyTrimmedString(request?.typeOfDocument);
  assignCaseDocumentIfPresent(formObj, request);
  return formObj;
};

const bindRequestToReferredToInTheStatementSectionObj = (request: any): ReferredToInTheStatementSection => {
  const formObj = createSectionWithDate(ReferredToInTheStatementSection, request);
  formObj.typeOfDocument = toNonEmptyTrimmedString(request?.typeOfDocument);
  formObj.witnessName = toNonEmptyTrimmedString(request?.witnessName);
  assignCaseDocumentIfPresent(formObj, request);
  return formObj;
};

const bindRequestToWitnessSectionObj = (request: any): WitnessSection => {
  const formObj = createSectionWithDate(WitnessSection, request);
  formObj.witnessName = toNonEmptyTrimmedString(request?.witnessName);
  assignCaseDocumentIfPresent(formObj, request);
  return formObj;
};

const bindRequestToWitnessSummarySectionObj = (request: any): WitnessSummarySection => {
  const formObj = createSectionWithDate(WitnessSummarySection, request);
  formObj.witnessName = toNonEmptyTrimmedString(request?.witnessName);
  assignCaseDocumentIfPresent(formObj, request);
  return formObj;
};

const bindRequestToExpertSectionObj = (request: any): ExpertSection => {
  const formObj: ExpertSection = new ExpertSection(request['dateInputFields']?.dateDay, request['dateInputFields']?.dateMonth, request['dateInputFields']?.dateYear);
  formObj.expertName = request['expertName'] != null ? request['expertName'].trim() : null;
  formObj.multipleExpertsName = request['multipleExpertsName'] != null ? request['multipleExpertsName'].trim() : null;
  formObj.fieldOfExpertise = request['fieldOfExpertise'] != null ? request['fieldOfExpertise'].trim() : null;
  formObj.otherPartyName = request['otherPartyName'] != null ? request['otherPartyName'].trim() : null;
  formObj.questionDocumentName = request['questionDocumentName'] != null ? request['questionDocumentName'].trim() : null;
  formObj.otherPartyQuestionsDocumentName = request['otherPartyQuestionsDocumentName'] != null ? request['otherPartyQuestionsDocumentName'].trim() : null;
  if (request['caseDocument'] && request['caseDocument'] !== '') {
    formObj.caseDocument = JSON.parse(request['caseDocument']) as CaseDocument;
  }
  return formObj;
};

const bindRequestToFileOnlySectionObj = (request: NonNullable<unknown> ): FileOnlySection => {
  const formObj: FileOnlySection = new FileOnlySection();
  assignCaseDocumentIfPresent(formObj, request);
  return formObj;
};

export const getCaseProgressionCancelUrl = async (claimId: string, claim: Claim) => {
  if (claim.isClaimant()) {
    const isCUIR2Enabled = await isCUIReleaseTwoEnabled();
    if (isCUIR2Enabled) {
      return constructResponseUrlWithIdParams(claimId, DASHBOARD_CLAIMANT_URL);
    }
    return constructResponseUrlWithIdParams(claimId, OLD_DASHBOARD_CLAIMANT_URL);
  }
  return constructResponseUrlWithIdParams(claimId, DEFENDANT_SUMMARY_URL);
};

function toNonEmptyTrimmedString(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

const parseCaseDocument = (request: any): CaseDocument | undefined => {
  const CASE_DOCUMENT = 'caseDocument';
  const rawCaseDoc = request?.[CASE_DOCUMENT];
  if (rawCaseDoc === undefined || rawCaseDoc === null || rawCaseDoc === '') {
    logger.error('Case document is missing');
    return undefined;
  }
  if (typeof rawCaseDoc === 'string') {
    try {
      return JSON.parse(rawCaseDoc) as CaseDocument;
    } catch {
      logger.error('Error parsing case document');
      return undefined;
    }
  }
  return rawCaseDoc as CaseDocument;
};

type DateCtor<T> = new (day?: string, month?: string, year?: string) => T;

interface DateParts {
  day?: string;
  month?: string;
  year?: string;
}

const readDateParts = (request: unknown): DateParts => {
  const dateFields = (request as any)?.dateInputFields ?? {};
  const day = dateFields?.dateDay !== undefined ? String(dateFields.dateDay) : undefined;
  const month = dateFields?.dateMonth !== undefined ? String(dateFields.dateMonth) : undefined;
  const year = dateFields?.dateYear !== undefined ? String(dateFields.dateYear) : undefined;
  return { day, month, year };
};

const createSectionWithDate = <T>(Ctor: DateCtor<T>, request: unknown): T => {
  const { day, month, year } = readDateParts(request);
  return new Ctor(day, month, year);
};

const assignCaseDocumentIfPresent = <T extends { caseDocument?: CaseDocument }>(target: T, request: unknown): void => {
  const parsed = parseCaseDocument(request as any);
  if (parsed) {
    target.caseDocument = parsed;
  }
};

