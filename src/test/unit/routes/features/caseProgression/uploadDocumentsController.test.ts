import {Response} from 'express';
import {ValidationError} from 'class-validator';
import {GenericForm} from 'form/models/genericForm';
import {ClaimSummaryType} from 'form/models/claimSummarySection';
import {CaseDocument} from 'models/document/caseDocument';
import {EvidenceUploadDisclosure} from 'models/document/documentType';
import {Claim} from 'models/claim';
import {AppRequest} from 'models/AppRequest';
import {CivilServiceClient} from 'client/civilServiceClient';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';
import {getClaimById} from 'modules/utilityService';
import {addAnother, getUploadDocumentsForm, saveCaseProgression} from 'services/features/caseProgression/caseProgressionService';
import * as DisclosureService from 'services/features/caseProgression/disclosureService';
import * as WitnessService from 'services/features/caseProgression/witnessService';
import {getExpertContent} from 'services/features/caseProgression/expertService';
import {getTrialContent} from 'services/features/caseProgression/trialService';
import {TypeOfDocumentSectionMapper} from 'services/features/caseProgression/TypeOfDocumentSectionMapper';
import {
  DateInputFields,
  ExpertSection,
  FileOnlySection,
  ReferredToInTheStatementSection,
  TypeOfDocumentSection,
  UploadDocumentsUserForm,
  WitnessSection,
  WitnessSummarySection,
} from 'models/caseProgression/uploadDocumentsUserForm';
import uploadDocumentsController from 'routes/features/caseProgression/uploadDocumentsController';
import {CP_CHECK_ANSWERS_URL, CP_UPLOAD_DOCUMENTS_URL} from 'routes/urls';
import {getNextYearValue} from '../../../../utils/dateUtils';
import {createMockResponse, getRouteHandler} from '../../../../utils/getRouteHandler';
import civilClaimResponseMock from '../../../../utils/mocks/civilClaimResponseMock.json';
import civilClaimResponseDocumentUploadedMock from '../../../../utils/mocks/civilClaimResponseDocumentUploadedMock.json';
import civilClaimResponseDocumentUploadedClaimantMock from '../../../../utils/mocks/civilClaimResponseDocumentUploadedClaimantMock.json';

jest.mock('client/civilServiceClient', () => {
  const methods = {uploadDocument: jest.fn()};
  return {CivilServiceClient: jest.fn(() => methods)};
});

jest.mock('modules/utilityService', () => ({
  getClaimById: jest.fn(),
}));

jest.mock('services/features/caseProgression/caseProgressionService', () => ({
  saveCaseProgression: jest.fn(),
  getUploadDocumentsForm: jest.fn(),
  addAnother: jest.fn(),
}));

jest.mock('services/features/caseProgression/disclosureService');
jest.mock('services/features/caseProgression/witnessService');
jest.mock('services/features/caseProgression/expertService');
jest.mock('services/features/caseProgression/trialService');

const civilServiceMethods = new CivilServiceClient('http://localhost') as unknown as {
  uploadDocument: jest.Mock;
};
const mockGetClaimById = getClaimById as jest.Mock;
const mockGetUploadDocumentsForm = getUploadDocumentsForm as jest.Mock;
const mockSaveCaseProgression = saveCaseProgression as jest.Mock;
const mockAddAnother = addAnother as jest.Mock;
const mockGetDisclosureContent = DisclosureService.getDisclosureContent as jest.Mock;
const mockGetWitnessContent = WitnessService.getWitnessContent as jest.Mock;
const mockGetExpertContent = getExpertContent as jest.Mock;
const mockGetTrialContent = getTrialContent as jest.Mock;

const claimId = '1645882162449409';
const viewPath = 'features/caseProgression/upload-documents';
const futureYear = getNextYearValue().toString();

const caseDoc: CaseDocument = {
  documentLink: {document_url: 'http://test', document_binary_url: 'http://test/binary', document_filename: 'test.png'},
  documentName: 'test.png',
  documentType: EvidenceUploadDisclosure.DOCUMENTS_FOR_DISCLOSURE,
  documentSize: 86349,
  createdDatetime: new Date(2023, 11, 11),
  createdBy: 'test',
};

const claimFrom = (payload: {case_data: object}): Claim => Object.assign(new Claim(), payload.case_data);

const constraintMessages = (errors: ValidationError[] = []): string[] =>
  errors.flatMap(error => [
    ...Object.values(error.constraints ?? {}),
    ...constraintMessages(error.children ?? []),
  ]);

const pdfBuffer = Buffer.from('%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n');

const uploadedPdf = (fieldname: string, originalname = 'test-document.pdf') => ({
  fieldname,
  originalname,
  mimetype: 'application/pdf',
  size: pdfBuffer.length,
  buffer: pdfBuffer,
});

const emptyUploadForm = (): UploadDocumentsUserForm => {
  const form = new UploadDocumentsUserForm();
  form.documentsForDisclosure = [];
  form.disclosureList = [];
  form.witnessStatement = [];
  form.witnessSummary = [];
  form.noticeOfIntention = [];
  form.documentsReferred = [];
  form.expertReport = [];
  form.expertStatement = [];
  form.questionsForExperts = [];
  form.answersForExperts = [];
  form.trialCaseSummary = [];
  form.trialSkeletonArgument = [];
  form.trialAuthorities = [];
  form.trialCosts = [];
  form.trialDocumentary = [];
  return form;
};

const sectionWithDate = <T extends {dateInputFields: DateInputFields}>(section: T, day: string, month: string, year: string): T => {
  section.dateInputFields.dateDay = day;
  section.dateInputFields.dateMonth = month;
  section.dateInputFields.dateYear = year;
  section.dateInputFields.date = new Date(Number(year), Number(month) - 1, Number(day));
  return section;
};

describe('Upload document- upload document controller', () => {
  const getHandler = getRouteHandler(uploadDocumentsController, 'get', CP_UPLOAD_DOCUMENTS_URL);
  const postHandler = getRouteHandler(uploadDocumentsController, 'post', CP_UPLOAD_DOCUMENTS_URL);

  const invokePost = async (overrides: object = {}) => {
    const res = createMockResponse();
    const next = jest.fn();
    await postHandler(
      {params: {id: claimId}, body: {}, session: {user: {id: 'user-1'}}, ...overrides} as unknown as AppRequest,
      res as unknown as Response,
      next,
    );
    return {res, next};
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetDisclosureContent.mockImplementation((claim: Claim, form: GenericForm<UploadDocumentsUserForm>) => {
      const documentsForDisclosure = claim.caseProgression?.defendantDocuments?.documentsForDisclosure;
      if (form && documentsForDisclosure) {
        return [[{type: ClaimSummaryType.INPUT_ARRAY}]];
      }
      return [];
    });
    mockGetWitnessContent.mockReturnValue([]);
    mockGetExpertContent.mockReturnValue([]);
    mockGetTrialContent.mockReturnValue([]);
    mockSaveCaseProgression.mockResolvedValue(undefined);
    mockGetClaimById.mockResolvedValue(claimFrom(civilClaimResponseMock));
  });

  describe('on GET', () => {
    it('renders the page without a saved document form', async () => {
      const claim = claimFrom(civilClaimResponseMock);
      mockGetClaimById.mockResolvedValue(claim);
      const res = createMockResponse();
      const req = {params: {id: claimId}, originalUrl: '/upload-documents', session: {}} as unknown as AppRequest;

      await getHandler(req, res as unknown as Response, jest.fn());

      expect(req.session.previousUrl).toBe('/upload-documents');
      expect(mockGetDisclosureContent).toHaveBeenCalledWith(claim, null);
      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({
        claim,
        claimId,
        form: null,
      }));
    });

    it('renders a defendant upload form from the saved documents', async () => {
      const claim = claimFrom(civilClaimResponseDocumentUploadedMock);
      mockGetClaimById.mockResolvedValue(claim);
      const res = createMockResponse();

      await getHandler(
        {params: {id: claimId}, originalUrl: '/upload-documents', session: {}} as unknown as AppRequest,
        res as unknown as Response,
        jest.fn(),
      );

      const form = mockGetDisclosureContent.mock.calls[0][1] as GenericForm<UploadDocumentsUserForm>;
      expect(form.model).toBe(claim.caseProgression.defendantDocuments);
      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form}));
    });

    it('renders a claimant upload form from the saved documents', async () => {
      const claim = claimFrom(civilClaimResponseDocumentUploadedClaimantMock);
      mockGetClaimById.mockResolvedValue(claim);
      const res = createMockResponse();

      await getHandler(
        {params: {id: claimId}, originalUrl: '/upload-documents', session: {}} as unknown as AppRequest,
        res as unknown as Response,
        jest.fn(),
      );

      const form = mockGetDisclosureContent.mock.calls[0][1] as GenericForm<UploadDocumentsUserForm>;
      expect(form.model).toBe(claim.caseProgression.claimantDocuments);
      expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form}));
    });

    it('calls next when the claim cannot be loaded', async () => {
      const error = new Error('redis failure');
      mockGetClaimById.mockRejectedValue(error);
      const next = jest.fn();

      await getHandler(
        {params: {id: claimId}, session: {}} as unknown as AppRequest,
        createMockResponse() as unknown as Response,
        next,
      );

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('on POST', () => {
    const messagesFrom = (res: ReturnType<typeof createMockResponse>): string[] =>
      constraintMessages(res.render.mock.calls[0][1].form.errors);

    it('shows a type-of-document error when the disclosure section is empty', async () => {
      const form = new UploadDocumentsUserForm();
      form.documentsForDisclosure = [new TypeOfDocumentSection()];
      form.documentsForDisclosure[0].typeOfDocument = '';
      form.documentsForDisclosure[0].dateInputFields.dateDay = '';
      form.documentsForDisclosure[0].dateInputFields.dateMonth = '';
      form.documentsForDisclosure[0].dateInputFields.dateYear = '';
      mockGetUploadDocumentsForm.mockReturnValue(form);

      const {res} = await invokePost({});

      expect(res.render.mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(messagesFrom(res)).toContain('ERRORS.VALID_ENTER_TYPE_OF_DOCUMENT');
      expect(res.redirect).not.toHaveBeenCalled();
    });

    it('redirects when a disclosure section already has its document', async () => {
      const form = emptyUploadForm();
      const section = sectionWithDate(new TypeOfDocumentSection(), '01', '01', '2023');
      section.typeOfDocument = 'type';
      section.caseDocument = caseDoc;
      form.documentsForDisclosure = [section];
      mockGetUploadDocumentsForm.mockReturnValue(form);

      const {res} = await invokePost({});

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CP_CHECK_ANSWERS_URL));
    });

    it('shows day, month and year errors when the document date is invalid', async () => {
      const form = new UploadDocumentsUserForm();
      const section = new TypeOfDocumentSection();
      section.typeOfDocument = '';
      section.dateInputFields.dateDay = '33';
      section.dateInputFields.dateMonth = '33';
      section.dateInputFields.dateYear = '222';
      form.documentsForDisclosure = [section];
      mockGetUploadDocumentsForm.mockReturnValue(form);

      const {res} = await invokePost({});

      expect(messagesFrom(res)).toEqual(expect.arrayContaining([
        'ERRORS.VALID_ENTER_TYPE_OF_DOCUMENT',
        'ERRORS.VALID_REAL_DAY',
        'ERRORS.VALID_REAL_MONTH',
        'ERRORS.VALID_REAL_YEAR',
      ]));
    });

    it('shows a missing-day error', async () => {
      const form = new UploadDocumentsUserForm();
      const section = new TypeOfDocumentSection();
      section.typeOfDocument = '';
      section.dateInputFields.dateDay = '';
      section.dateInputFields.dateMonth = '11';
      section.dateInputFields.dateYear = '2022';
      form.documentsForDisclosure = [section];
      mockGetUploadDocumentsForm.mockReturnValue(form);

      const {res} = await invokePost({});

      expect(messagesFrom(res)).toEqual(expect.arrayContaining([
        'ERRORS.VALID_ENTER_TYPE_OF_DOCUMENT',
        'ERRORS.VALID_DATE_OF_DOC_MUST_INCLUDE_DAY',
      ]));
    });

    it('shows a missing-month error', async () => {
      const form = new UploadDocumentsUserForm();
      const section = new TypeOfDocumentSection();
      section.typeOfDocument = '';
      section.dateInputFields.dateDay = '11';
      section.dateInputFields.dateMonth = '';
      section.dateInputFields.dateYear = '2022';
      form.documentsForDisclosure = [section];
      mockGetUploadDocumentsForm.mockReturnValue(form);

      const {res} = await invokePost({});

      expect(messagesFrom(res)).toContain('ERRORS.VALID_DATE_OF_DOC_MUST_INCLUDE_MONTH');
    });

    it('shows a missing-year error', async () => {
      const form = new UploadDocumentsUserForm();
      const section = new TypeOfDocumentSection();
      section.typeOfDocument = '';
      section.dateInputFields.dateDay = '11';
      section.dateInputFields.dateMonth = '11';
      section.dateInputFields.dateYear = '';
      form.documentsForDisclosure = [section];
      mockGetUploadDocumentsForm.mockReturnValue(form);

      const {res} = await invokePost({});

      expect(messagesFrom(res)).toContain('ERRORS.VALID_DATE_OF_DOC_MUST_INCLUDE_YEAR');
    });

    it('shows a future-date error', async () => {
      const form = new UploadDocumentsUserForm();
      const section = sectionWithDate(new TypeOfDocumentSection(), '11', '10', futureYear);
      section.typeOfDocument = '';
      form.documentsForDisclosure = [section];
      mockGetUploadDocumentsForm.mockReturnValue(form);

      const {res} = await invokePost({});

      expect(messagesFrom(res)).toEqual(expect.arrayContaining([
        'ERRORS.VALID_ENTER_TYPE_OF_DOCUMENT',
        'ERRORS.VALID_DATE_NOT_FUTURE',
      ]));
    });

    it('accepts a past document date and still requires the document type', async () => {
      const form = new UploadDocumentsUserForm();
      const section = sectionWithDate(new TypeOfDocumentSection(), '12', '10', '2022');
      section.typeOfDocument = undefined;
      form.documentsForDisclosure = [section];
      mockGetUploadDocumentsForm.mockReturnValue(form);

      const {res} = await invokePost({});

      const messages = messagesFrom(res);
      expect(messages).toContain('ERRORS.VALID_ENTER_TYPE_OF_DOCUMENT');
      expect(messages).not.toContain('ERRORS.VALID_YOU_MUST_ENTER_DOI');
      expect(messages).not.toContain('ERRORS.VALID_DATE_NOT_FUTURE');
    });

    it('shows witness statement errors', async () => {
      const form = new UploadDocumentsUserForm();
      const section = new WitnessSection();
      section.witnessName = '';
      section.dateInputFields.dateDay = '';
      section.dateInputFields.dateMonth = '';
      section.dateInputFields.dateYear = '';
      form.witnessStatement = [section];
      mockGetUploadDocumentsForm.mockReturnValue(form);

      const {res} = await invokePost({});

      expect(messagesFrom(res)).toEqual(expect.arrayContaining([
        'ERRORS.VALID_ENTER_WITNESS_NAME',
        'ERRORS.VALID_YOU_MUST_ENTER_DOI',
      ]));
    });

    it('shows witness summary errors', async () => {
      const form = new UploadDocumentsUserForm();
      const section = new WitnessSummarySection();
      section.witnessName = '';
      section.dateInputFields.dateDay = '';
      section.dateInputFields.dateMonth = '';
      section.dateInputFields.dateYear = '';
      form.witnessSummary = [section];
      mockGetUploadDocumentsForm.mockReturnValue(form);

      const {res} = await invokePost({});

      expect(messagesFrom(res)).toEqual(expect.arrayContaining([
        'ERRORS.VALID_ENTER_WITNESS_NAME',
        'ERRORS.VALID_DATE_WITNESS_SUMMARY',
      ]));
    });

    it('shows expert report errors', async () => {
      const form = new UploadDocumentsUserForm();
      const section = new ExpertSection();
      section.expertName = '';
      section.fieldOfExpertise = '';
      section.questionDocumentName = '';
      section.otherPartyQuestionsDocumentName = '';
      section.dateInputFields.dateDay = '';
      section.dateInputFields.dateMonth = '';
      section.dateInputFields.dateYear = '';
      form.expertReport = [section];
      mockGetUploadDocumentsForm.mockReturnValue(form);

      const {res} = await invokePost({});

      expect(messagesFrom(res)).toEqual(expect.arrayContaining([
        'ERRORS.VALID_ENTER_EXPERT_NAME',
        'ERRORS.VALID_ENTER_EXPERTISE',
        'ERRORS.VALID_ENTER_DOCUMENT_QUESTIONS',
        'ERRORS.VALID_ENTER_DOCUMENT_QUESTIONS_OTHER_PARTY',
        'ERRORS.VALID_YOU_MUST_ENTER_DOI',
      ]));
    });

    it('shows questions-for-experts errors', async () => {
      const form = new UploadDocumentsUserForm();
      const section = new ExpertSection();
      section.otherPartyName = '';
      section.expertName = '';
      section.questionDocumentName = '';
      section.dateInputFields.dateDay = '';
      section.dateInputFields.dateMonth = '';
      section.dateInputFields.dateYear = '';
      form.questionsForExperts = [section];
      mockGetUploadDocumentsForm.mockReturnValue(form);

      const {res} = await invokePost({});

      expect(messagesFrom(res)).toEqual(expect.arrayContaining([
        'ERRORS.VALID_ENTER_EXPERT_NAME',
        'ERRORS.VALID_SELECT_OTHER_PARTY',
        'ERRORS.VALID_ENTER_DOCUMENT_QUESTIONS',
        'ERRORS.VALID_CHOOSE_THE_FILE',
      ]));
    });

    it('shows questions-for-experts errors when the question document name is omitted', async () => {
      const form = new UploadDocumentsUserForm();
      const section = new ExpertSection();
      section.otherPartyName = '';
      section.expertName = '';
      section.questionDocumentName = undefined;
      form.questionsForExperts = [section];
      mockGetUploadDocumentsForm.mockReturnValue(form);

      const {res} = await invokePost({});

      expect(res.render.mock.calls[0][1].form.hasErrors()).toBe(true);
      expect(messagesFrom(res)).not.toContain('ERRORS.VALID_ENTER_DOCUMENT_QUESTIONS');
    });

    it('shows answers-for-experts errors', async () => {
      const form = new UploadDocumentsUserForm();
      const section = new ExpertSection();
      section.otherPartyName = '';
      section.expertName = '';
      section.otherPartyQuestionsDocumentName = '';
      section.dateInputFields.dateDay = '';
      section.dateInputFields.dateMonth = '';
      section.dateInputFields.dateYear = '';
      form.answersForExperts = [section];
      mockGetUploadDocumentsForm.mockReturnValue(form);

      const {res} = await invokePost({});

      expect(messagesFrom(res)).toEqual(expect.arrayContaining([
        'ERRORS.VALID_ENTER_EXPERT_NAME',
        'ERRORS.VALID_SELECT_OTHER_PARTY',
        'ERRORS.VALID_ENTER_DOCUMENT_QUESTIONS_OTHER_PARTY',
        'ERRORS.VALID_CHOOSE_THE_FILE',
      ]));
    });

    it('redirects when every uploaded section is valid', async () => {
      const form = new UploadDocumentsUserForm();
      const disclosure = sectionWithDate(new TypeOfDocumentSection(), '14', '11', '2020');
      disclosure.typeOfDocument = 'Word';
      disclosure.caseDocument = caseDoc;
      form.documentsForDisclosure = [disclosure];

      const disclosureList = new FileOnlySection();
      disclosureList.caseDocument = caseDoc;
      form.disclosureList = [disclosureList];

      const witness = sectionWithDate(new WitnessSection(), '10', '11', '2020');
      witness.witnessName = 'witness Name';
      witness.caseDocument = caseDoc;
      form.witnessStatement = [witness];

      const summary = sectionWithDate(new WitnessSummarySection(), '10', '11', '2020');
      summary.witnessName = 'witness Name 1';
      summary.caseDocument = caseDoc;
      form.witnessSummary = [summary];

      const notice = sectionWithDate(new WitnessSection(), '12', '11', '2020');
      notice.witnessName = 'witness Name 2';
      notice.caseDocument = caseDoc;
      form.noticeOfIntention = [notice];

      const referred = sectionWithDate(new ReferredToInTheStatementSection(), '13', '11', '2020');
      referred.witnessName = 'witness Name 3';
      referred.typeOfDocument = 'pdf';
      referred.caseDocument = caseDoc;
      form.documentsReferred = [referred];

      const expert = sectionWithDate(new ExpertSection(), '11', '12', '2020');
      expert.expertName = 'expert Name';
      expert.fieldOfExpertise = 'field Of Expertise';
      expert.questionDocumentName = 'question Document Name';
      expert.otherPartyQuestionsDocumentName = 'O. p. Document Name';
      expert.caseDocument = caseDoc;
      form.expertReport = [expert];

      const questions = sectionWithDate(new ExpertSection(), '10', '10', '2020');
      questions.expertName = 'expert Name 1';
      questions.otherPartyName = 'other party';
      questions.questionDocumentName = 'question Document Name';
      questions.caseDocument = caseDoc;
      form.questionsForExperts = [questions];

      const statement = sectionWithDate(new ExpertSection(), '14', '10', '2020');
      statement.expertName = 'John Dhoe';
      statement.fieldOfExpertise = 'Architect';
      statement.otherPartyName = 'Mark Smith';
      statement.caseDocument = caseDoc;
      form.expertStatement = [statement];

      const answers = sectionWithDate(new ExpertSection(), '14', '10', '2020');
      answers.expertName = 'expert Name 2';
      answers.otherPartyName = 'other party';
      answers.otherPartyQuestionsDocumentName = 'O. p. Document Name';
      answers.caseDocument = caseDoc;
      form.answersForExperts = [answers];

      const trialCaseSummary = new FileOnlySection();
      trialCaseSummary.caseDocument = caseDoc;
      form.trialCaseSummary = [trialCaseSummary];
      const trialSkeleton = new FileOnlySection();
      trialSkeleton.caseDocument = caseDoc;
      form.trialSkeletonArgument = [trialSkeleton];
      const trialAuthorities = new FileOnlySection();
      trialAuthorities.caseDocument = caseDoc;
      form.trialAuthorities = [trialAuthorities];
      const trialCosts = new FileOnlySection();
      trialCosts.caseDocument = caseDoc;
      form.trialCosts = [trialCosts];
      const trialDocumentary = sectionWithDate(new TypeOfDocumentSection(), '14', '11', '2020');
      trialDocumentary.typeOfDocument = 'Word';
      trialDocumentary.caseDocument = caseDoc;
      form.trialDocumentary = [trialDocumentary];

      mockGetUploadDocumentsForm.mockReturnValue(form);

      const {res} = await invokePost({});

      expect(mockSaveCaseProgression).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CP_CHECK_ANSWERS_URL));
    });

    it('calls next when the claim cannot be loaded', async () => {
      const error = new Error('redis failure');
      mockGetClaimById.mockRejectedValue(error);
      mockGetUploadDocumentsForm.mockReturnValue(new UploadDocumentsUserForm());

      const {next} = await invokePost({});

      expect(next).toHaveBeenCalledWith(error);
    });

    describe('File upload validation and error handling', () => {
      const formWithSection = (assign: (form: UploadDocumentsUserForm) => void): UploadDocumentsUserForm => {
        const form = new UploadDocumentsUserForm();
        assign(form);
        mockGetUploadDocumentsForm.mockReturnValue(form);
        return form;
      };

      it('rejects a video file', async () => {
        formWithSection(form => {
          form.witnessStatement = [new WitnessSection()];
        });

        const {res, next} = await invokePost({
          body: {action: 'witnessStatement[0][uploadButton]'},
          files: [{
            fieldname: 'witnessStatement[0][fileUpload]',
            originalname: 'test-video.mov',
            mimetype: 'video/quicktime',
            size: 1024,
            buffer: Buffer.from('Video file content'),
          }],
        });

        expect(messagesFrom(res)).toContain('ERRORS.VALID_MIME_TYPE_FILE');
        expect(civilServiceMethods.uploadDocument).not.toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
      });

      it('rejects non-PDF content sent as a PDF', async () => {
        formWithSection(form => {
          form.expertReport = [new ExpertSection()];
        });

        const {res} = await invokePost({
          body: {action: 'expertReport[0][uploadButton]'},
          files: [{
            fieldname: 'expertReport[0][fileUpload]',
            originalname: 'spoofed.pdf',
            mimetype: 'application/pdf',
            size: 64,
            buffer: Buffer.from('This is not a real PDF. There is no PDF signature at the start of this file.\n'),
          }],
        });

        expect(messagesFrom(res)).toContain('ERRORS.VALID_MIME_TYPE_FILE');
        expect(civilServiceMethods.uploadDocument).not.toHaveBeenCalled();
      });

      it('saves a valid PDF on the expert report', async () => {
        const form = formWithSection(target => {
          target.expertReport = [new ExpertSection()];
        });
        civilServiceMethods.uploadDocument.mockResolvedValue({
          documentName: 'test-document.pdf',
          documentLink: {document_url: 'http://test', document_binary_url: 'http://test/binary', document_filename: 'test-document.pdf'},
        });

        const {res} = await invokePost({
          body: {action: 'expertReport[0][uploadButton]'},
          files: [uploadedPdf('expertReport[0][fileUpload]')],
        });

        expect(civilServiceMethods.uploadDocument).toHaveBeenCalled();
        expect(form.expertReport[0].caseDocument.documentName).toBe('test-document.pdf');
        expect(res.render).toHaveBeenCalledWith(viewPath, expect.objectContaining({form: expect.any(GenericForm)}));
      });

      it('keeps the page when the document service rejects the upload', async () => {
        formWithSection(form => {
          form.documentsReferred = [new ReferredToInTheStatementSection()];
        });
        civilServiceMethods.uploadDocument.mockRejectedValue(new Error('Internal server error'));

        const {res, next} = await invokePost({
          body: {action: 'documentsReferred[0][uploadButton]'},
          files: [uploadedPdf('documentsReferred[0][fileUpload]')],
        });

        expect(messagesFrom(res)).toContain('ERRORS.FILE_UPLOAD_FAILED');
        expect(next).not.toHaveBeenCalled();
      });

      it('saves a valid PDF on the expert statement', async () => {
        const form = formWithSection(target => {
          target.expertStatement = [new ExpertSection()];
        });
        civilServiceMethods.uploadDocument.mockResolvedValue({
          documentName: 'expert-statement.pdf',
          documentLink: {document_url: 'http://test', document_binary_url: 'http://test/binary', document_filename: 'expert-statement.pdf'},
        });

        await invokePost({
          body: {action: 'expertStatement[0][uploadButton]'},
          files: [uploadedPdf('expertStatement[0][fileUpload]', 'expert-statement.pdf')],
        });

        expect(form.expertStatement[0].caseDocument.documentName).toBe('expert-statement.pdf');
      });

      it('rejects a file that is over the size limit', async () => {
        formWithSection(form => {
          form.documentsReferred = [new ReferredToInTheStatementSection()];
        });
        const originalMap = TypeOfDocumentSectionMapper.mapMulterFileToSingleFile.bind(TypeOfDocumentSectionMapper);
        jest.spyOn(TypeOfDocumentSectionMapper, 'mapMulterFileToSingleFile').mockImplementationOnce(file => {
          const fileUpload = originalMap(file);
          fileUpload.size = 101 * 1024 * 1024;
          return fileUpload;
        });

        const {res} = await invokePost({
          body: {action: 'documentsReferred[0][uploadButton]'},
          files: [uploadedPdf('documentsReferred[0][fileUpload]', 'large-file.pdf')],
        });

        expect(messagesFrom(res)).toContain('ERRORS.VALID_SIZE_FILE');
      });

      it('renders a file error when mapping the upload throws', async () => {
        formWithSection(form => {
          form.witnessStatement = [new WitnessSection()];
        });
        jest.spyOn(TypeOfDocumentSectionMapper, 'mapMulterFileToSingleFile').mockImplementationOnce(() => {
          throw new Error('Unexpected mapping error');
        });

        const {res, next} = await invokePost({
          body: {action: 'witnessStatement[0][uploadButton]'},
          files: [uploadedPdf('witnessStatement[0][fileUpload]', 'test.pdf')],
        });

        expect(messagesFrom(res)).toContain('ERRORS.FILE_UPLOAD_FAILED');
        expect(next).not.toHaveBeenCalled();
      });

      it('renders a size error reported by multer', async () => {
        formWithSection(form => {
          form.documentsReferred = [new ReferredToInTheStatementSection()];
        });

        const {res} = await invokePost({
          body: {action: 'documentsReferred[0][uploadButton]'},
          multerError: {code: 'LIMIT_FILE_SIZE'},
        });

        expect(messagesFrom(res)).toContain('ERRORS.VALID_SIZE_FILE');
        expect(civilServiceMethods.uploadDocument).not.toHaveBeenCalled();
      });

      it('saves the form when the upload button is used without a matching file', async () => {
        formWithSection(form => {
          form.documentsReferred = [new ReferredToInTheStatementSection()];
        });

        const {res} = await invokePost({
          body: {action: 'documentsReferred[0][uploadButton]'},
          files: [],
        });

        expect(civilServiceMethods.uploadDocument).not.toHaveBeenCalled();
        expect(mockSaveCaseProgression).toHaveBeenCalled();
        expect(res.render).toHaveBeenCalled();
      });

      it('saves and re-renders when multer fails for an action other than upload', async () => {
        formWithSection(() => undefined);

        const {res} = await invokePost({
          body: {action: 'save'},
          multerError: {code: 'LIMIT_FILE_SIZE'},
        });

        expect(mockSaveCaseProgression).toHaveBeenCalled();
        expect(res.render).toHaveBeenCalled();
        expect(res.redirect).not.toHaveBeenCalled();
        expect(civilServiceMethods.uploadDocument).not.toHaveBeenCalled();
      });
    });

    it('removes the disclosure document at the selected index', async () => {
      const form = new UploadDocumentsUserForm();
      form.documentsForDisclosure = [new TypeOfDocumentSection(), new TypeOfDocumentSection()];
      form.documentsForDisclosure[0].typeOfDocument = 'Doc 1';
      form.documentsForDisclosure[1].typeOfDocument = 'Doc 2';
      mockGetUploadDocumentsForm.mockReturnValue(form);

      const {res} = await invokePost({body: {action: 'documentsForDisclosure[0][removeButton]'}});

      expect(res.render).toHaveBeenCalled();
      expect(form.documentsForDisclosure).toHaveLength(1);
      expect(form.documentsForDisclosure[0].typeOfDocument).toBe('Doc 2');
    });

    it('removes the middle trial authority', async () => {
      const form = new UploadDocumentsUserForm();
      form.trialAuthorities = [new FileOnlySection(), new FileOnlySection(), new FileOnlySection()];
      form.trialAuthorities[0].caseDocument = {documentName: 'Doc 1'} as CaseDocument;
      form.trialAuthorities[1].caseDocument = {documentName: 'Doc 2'} as CaseDocument;
      form.trialAuthorities[2].caseDocument = {documentName: 'Doc 3'} as CaseDocument;
      mockGetUploadDocumentsForm.mockReturnValue(form);

      await invokePost({body: {action: 'trialAuthorities[1][removeButton]'}});

      expect(form.trialAuthorities).toHaveLength(2);
      expect(form.trialAuthorities[0].caseDocument.documentName).toBe('Doc 1');
      expect(form.trialAuthorities[1].caseDocument.documentName).toBe('Doc 3');
    });

    it('adds another disclosure row without saving', async () => {
      const form = new UploadDocumentsUserForm();
      form.documentsForDisclosure = [new TypeOfDocumentSection()];
      mockGetUploadDocumentsForm.mockReturnValue(form);

      const {res} = await invokePost({body: {action: 'add_another-disclosure'}});

      expect(res.render).toHaveBeenCalled();
      expect(mockAddAnother).toHaveBeenCalledWith(form, 'add_another-disclosure', claimId, 'user-1');
      expect(mockSaveCaseProgression).not.toHaveBeenCalled();
    });

    it('does not validate the form when add another is submitted', async () => {
      const form = new UploadDocumentsUserForm();
      form.documentsForDisclosure = [new TypeOfDocumentSection()];
      form.documentsForDisclosure[0].typeOfDocument = '';
      mockGetUploadDocumentsForm.mockReturnValue(form);
      const validateSyncSpy = jest.spyOn(GenericForm.prototype, 'validateSync');

      await invokePost({body: {action: 'add_another-disclosure'}});

      expect(validateSyncSpy).not.toHaveBeenCalled();
      validateSyncSpy.mockRestore();
    });

    it('drops unknown validation errors and redirects when nothing real remains', async () => {
      const form = new UploadDocumentsUserForm();
      const section = sectionWithDate(new TypeOfDocumentSection(), '10', '10', '2020');
      section.typeOfDocument = 'Word';
      section.caseDocument = caseDoc;
      form.documentsForDisclosure = [section];
      mockGetUploadDocumentsForm.mockReturnValue(form);
      const validateSyncSpy = jest.spyOn(GenericForm.prototype, 'validateSync').mockImplementation(function validate(this: GenericForm<unknown>) {
        this.errors = [
          {property: 'placeholder', constraints: {unknownValue: 'an unknown value was passed to the validate function'}, children: []},
          {property: 'emptyParent', children: []},
        ] as ValidationError[];
      });

      const {res} = await invokePost({});

      expect(res.redirect).toHaveBeenCalledWith(constructResponseUrlWithIdParams(claimId, CP_CHECK_ANSWERS_URL));
      validateSyncSpy.mockRestore();
    });
  });
});
