import express, {Request, Response, Router} from 'express';
import request from 'supertest';
import controller from 'routes/features/caseProgression/uploadDocumentsController';
import checkAnswersController from 'routes/features/caseProgression/checkAnswersController';
import {toCUICaseProgression} from 'services/translation/convertToCUI/convertToCUICaseProgression';
import {UploadEvidenceDocumentType} from 'models/caseProgression/uploadDocumentsType';
import {CCDClaim} from 'models/civilClaimResponse';
import {AppRequest} from 'models/AppRequest';
import typeOfDocumentsController from 'routes/features/caseProgression/typeOfDocumentsController';
import mediationController from 'routes/features/mediation/uploadDocuments/uploadDocumentsController';
import {MEDIATION_UPLOAD_DOCUMENTS} from 'routes/urls';
import {UploadDocuments as MediationUploads, TypeOfDocuments, TypeOfMediationDocuments} from 'models/mediation/uploadDocuments/uploadDocuments';
import {getUploadDocumentsForm as getMediationForm} from 'services/features/mediation/uploadDocuments/uploadDocumentsService';
import {CP_UPLOAD_DOCUMENTS_URL, TYPES_OF_DOCUMENTS_URL, CP_CHECK_ANSWERS_URL} from 'routes/urls';
import {getClaimById} from 'modules/utilityService';
import {getCaseDataFromStore, saveDraftClaim, deleteDraftClaimFromStore} from 'modules/draft-store/draftStoreService';
import {CaseRole} from 'form/models/caseRoles';
import {getTypeDocumentForm, getUploadDocumentsForm} from 'services/features/caseProgression/caseProgressionService';
import {renderUploadPage} from '../../../test/utils/renderUploadForms';
import {dqClaim} from '../../../test/utils/renderDqRepeatedRows';
const {JSDOM} = require('jsdom');
const qs = require('qs');
jest.mock('modules/draft-store/draftStoreService', () => ({getCaseDataFromStore: jest.fn(), saveDraftClaim: jest.fn(), deleteDraftClaimFromStore: jest.fn(), generateRedisKey: jest.fn(() => 'local-store')}));
jest.mock('modules/utilityService', () => ({getClaimById: jest.fn()}));
jest.mock('client/civilServiceClient', () => {
  const uploadDocument = jest.fn(async () => ({documentName: 'new.txt', documentLink: {document_url: '/new', document_binary_url: '/new/binary', document_filename: 'new.txt'}}));
  const retrieveClaimDetails = jest.fn();
  const submitEvent = jest.fn();
  const updateTaskStatus = jest.fn();
  return {CivilServiceClient: jest.fn().mockImplementation(() => ({uploadDocument, retrieveClaimDetails, submitEvent, updateTaskStatus})), uploadDocument, retrieveClaimDetails, submitEvent, updateTaskStatus};
});

function fields(html: string) {
  const dom = new JSDOM(html);
  try {return [...dom.window.document.querySelectorAll('input:not([type=file]),select,textarea')].filter((e: HTMLInputElement) => e.name).map((e: HTMLInputElement) => [e.name,e.value] as [string,string]);} finally {dom.window.close();}
}
type Metadata = Record<string, string | Record<string, string>>;
const newDocument = {documentName: 'new.txt', documentLink: {document_url: '/new', document_binary_url: '/new/binary', document_filename: 'new.txt'}};
const mockUploadDocument = jest.requireMock('client/civilServiceClient').uploadDocument as jest.Mock;

beforeEach(() => jest.clearAllMocks());

function submitted(html: string): Request {
  return {body: qs.parse(new URLSearchParams(fields(html)).toString())} as Request;
}

function appFor(router: Router, language: string) {
  const app = express();
  app.use(express.urlencoded({extended: true}));
  app.use((req, res, next) => {
    req.session = {user: {id: 'local-user'}, dashboard: {taskIdHearingUploadDocuments: 'upload-task'}, save: (callback: () => void) => callback()} as unknown as Request['session'];
    req.cookies = {};
    // The actual GET/POST controller supplies the content and page variables.
    // The helper substitutes the outer shell and supplies translations/CSRF.
    res.render = ((view: string, values: Record<string, unknown>) => res.send(renderUploadPage(view + '.njk', language, values))) as unknown as Response['render'];
    next();
  });
  app.use(router);
  return app;
}

function post(app: ReturnType<typeof express>, url: string, html: string, action: string, metadata?: {category: string; values: Metadata; index?: number}) {
  const values = fields(html);
  function set(name: string, value: string) {
    const matches = values.filter(([field]) => field === name);
    expect(matches).toHaveLength(1);
    matches[0][1] = value;
  }
  if (metadata) for (const [key, value] of Object.entries(metadata.values)) {
    const prefix = `${metadata.category}[${metadata.index ?? 2}][${key}]`;
    if (typeof value === 'string') set(prefix, value);
    else for (const [part, text] of Object.entries(value)) set(`${prefix}[${part}]`, text);
  }
  let call = request(app).post(url).field('action', action);
  for (const [name, value] of values) call = call.field(name, value);
  return call;
}

function row(category: string, index: number, metadata: Metadata) {
  return {...metadata, caseDocument: JSON.stringify({
    createdBy: 'local-user', createdDatetime: '2024-01-01T12:00:00Z', documentSize: 100 + index,
    documentName: `${category}-${index}.pdf`,
    documentLink: {document_url: `/documents/${category}/${index}`, document_binary_url: `/documents/${category}/${index}/binary`, document_filename: `${category}-${index}.pdf`},
  })};
}

// Populate only metadata rendered by the category, with distinct row values.
function metadataFor(category: string, index: number, otherParty = ''): Metadata {
  const dateInputFields = {dateDay: String(index + 1), dateMonth: String(index + 2), dateYear: '2024'};
  switch (category) {
    case 'documentsForDisclosure':
    case 'trialDocumentary':
    case 'documentsForDocumentsReferred':
      return {typeOfDocument: `Description ${index}`, dateInputFields};
    case 'documentsReferred':
      return {typeOfDocument: `Description ${index}`, witnessName: `Witness ${index}`, dateInputFields};
    case 'witnessStatement':
    case 'witnessSummary':
    case 'noticeOfIntention':
      return {witnessName: `Witness ${index}`, dateInputFields};
    case 'expertReport':
    case 'expertStatement':
      return {expertName: `Expert ${index}`, fieldOfExpertise: `Specialism ${index}`, dateInputFields};
    case 'questionsForExperts':
      return {expertName: `Expert ${index}`, otherPartyName: otherParty, questionDocumentName: `Question ${index}`};
    case 'answersForExperts':
      return {expertName: `Expert ${index}`, otherPartyName: otherParty, otherPartyQuestionsDocumentName: `Answer ${index}`};
    case 'documentsForYourStatement':
      return {yourName: `Person ${index}`, dateInputFields};
    case 'disclosureList':
    case 'trialCaseSummary':
    case 'trialSkeletonArgument':
    case 'trialAuthorities':
    case 'trialCosts':
      return {};
    default:
      throw new Error(`Missing fixture metadata for ${category}`);
  }
}
const caseProgressionCases = [
  {category: 'documentsForDisclosure', action: 'disclosure', selection: 'documents'},
  {category: 'disclosureList', action: 'disclosureList', selection: 'list'},
  {category: 'documentsReferred', action: 'documentsReferred', selection: 'witnessDocuments'},
  {category: 'expertReport', action: 'expertReport', selection: 'report'},
  {category: 'questionsForExperts', action: 'questionsForExperts', selection: 'questions'},
  {category: 'answersForExperts', action: 'answersForExperts', selection: 'answer'},
] as const;

describe.each([false, true])('case progression multipart preservation (claimant=%s)', claimant => {
  describe.each(caseProgressionCases)('$category', ({category, action, selection}) => {
    it.each([0, 1, 2])('removes row %s, adds and uploads with complete metadata and separate role storage', async removedIndex => {
      const claim = dqClaim(claimant);
      claim.caseRole = claimant ? CaseRole.CLAIMANT : CaseRole.DEFENDANT;
      const otherParty = claimant ? claim.getDefendantFullName() : claim.getClaimantFullName();
      const independent = category === 'disclosureList' ? 'documentsForDisclosure' : 'disclosureList';
      const seed = {
        [category]: [0, 1, 2].map(index => row(category, index, metadataFor(category, index, otherParty))),
        [independent]: [row(independent, 0, metadataFor(independent, 0))],
      };
      const expected = getUploadDocumentsForm({body: seed} as Request);
      const ownKey = claimant ? 'claimantDocuments' : 'defendantDocuments';
      const otherKey = claimant ? 'defendantDocuments' : 'claimantDocuments';
      const selected = getTypeDocumentForm({body: {[selection]: true, [independent === 'disclosureList' ? 'list' : 'documents']: true}} as Request);
      claim.caseProgression = {
        [claimant ? 'claimantUploadDocuments' : 'defendantUploadDocuments']: selected,
        [ownKey]: getUploadDocumentsForm({body: seed} as Request),
        [otherKey]: getUploadDocumentsForm({body: {disclosureList: [row('other-role', 9, {})]}} as Request),
      };
      const otherBefore = JSON.stringify(claim.caseProgression[otherKey]);
      (getClaimById as jest.Mock).mockResolvedValue(claim);
      (getCaseDataFromStore as jest.Mock).mockResolvedValue(claim);
      const app = appFor(controller, claimant ? 'en' : 'cy');
      const url = CP_UPLOAD_DOCUMENTS_URL.replace(':id', '1645882162449409');

      const initial = await request(app).get(url).expect(200);
      expect(getUploadDocumentsForm(submitted(initial.text))).toEqual(expected);
      const removed = await post(app, url, initial.text, `${category}[${removedIndex}][removeButton]`).expect(200);
      const survivors = getUploadDocumentsForm(submitted(removed.text));
      expect(survivors).toEqual({...expected, [category]: expected[category].filter((_, index) => index !== removedIndex)});
      expect(claim.caseProgression[ownKey]).toEqual(survivors);

      const added = await post(app, url, removed.text, `add_another-${action}`).expect(200);
      const addedModel = getUploadDocumentsForm(submitted(added.text));
      expect(addedModel[category]).toHaveLength(3);
      expect(addedModel[category][2].caseDocument).toBeUndefined();
      expect({...addedModel, [category]: addedModel[category].slice(0, 2)}).toEqual(survivors);
      const newMetadata = metadataFor(category, 3, otherParty);
      const saved = await post(app, url, added.text, `${category}[2][uploadButton]`, {category, values: newMetadata})
        .attach(`${category}[2][fileUpload]`, Buffer.from('Safe local text'), 'new.txt').expect(200);
      const expectedFinal = getUploadDocumentsForm({body: {
        ...seed,
        [category]: [...seed[category].filter((_, index) => index !== removedIndex), {...newMetadata, caseDocument: JSON.stringify(newDocument)}],
      }} as Request);
      expect(getUploadDocumentsForm(submitted(saved.text))).toEqual(expectedFinal);
      expect(claim.caseProgression[ownKey]).toEqual(expectedFinal);
      expect(JSON.stringify(claim.caseProgression[otherKey])).toBe(otherBefore);
      expect(saveDraftClaim).toHaveBeenLastCalledWith('local-store', claim);

      // Redisplay from stored state, then act on the independent category.
      const redisplay = await request(app).get(url).expect(200);
      expect(getUploadDocumentsForm(submitted(redisplay.text))).toEqual(expectedFinal);
      const independentAction = independent === 'disclosureList' ? 'disclosureList' : 'disclosure';
      const next = await post(app, url, redisplay.text, `add_another-${independentAction}`).expect(200);
      const nextModel = getUploadDocumentsForm(submitted(next.text));
      expect(nextModel[independent]).toHaveLength(2);
      expect({...nextModel, [independent]: nextModel[independent].slice(0, 1)}).toEqual(expectedFinal);
      expect(JSON.stringify(claim.caseProgression[otherKey])).toBe(otherBefore);
    });
  });
});

it.each([0, 1, 2])('characterises Save on row %s when two multipart files are pending', async target => {
  const seed = {documentsForDisclosure: [0, 1, 2].map(index => row('documentsForDisclosure', index, metadataFor('documentsForDisclosure', index)))};
  const expected = getUploadDocumentsForm({body: {
    documentsForDisclosure: seed.documentsForDisclosure.map((item, index) => index === target && target < 2
      ? {...item, caseDocument: JSON.stringify(newDocument)} : item),
  }} as Request);
  const claim = dqClaim(true);
  claim.caseRole = CaseRole.CLAIMANT;
  claim.caseProgression = {
    claimantUploadDocuments: getTypeDocumentForm({body: {documents: true}} as Request),
    claimantDocuments: getUploadDocumentsForm({body: seed} as Request),
  };
  (getClaimById as jest.Mock).mockResolvedValue(claim);
  (getCaseDataFromStore as jest.Mock).mockResolvedValue(claim);
  const app = appFor(controller, 'en');
  const url = CP_UPLOAD_DOCUMENTS_URL.replace(':id', '1645882162449409');
  const initial = await request(app).get(url).expect(200);
  const saved = await post(app, url, initial.text, `documentsForDisclosure[${target}][uploadButton]`)
    .attach('documentsForDisclosure[0][fileUpload]', Buffer.from('First pending file'), 'first.txt')
    .attach('documentsForDisclosure[1][fileUpload]', Buffer.from('Second pending file'), 'second.txt').expect(200);
  if (target < 2) {
    expect(mockUploadDocument).toHaveBeenCalledTimes(1);
    expect(mockUploadDocument.mock.calls[0][1]).toEqual(expect.objectContaining({
      fieldname: `documentsForDisclosure[${target}][fileUpload]`,
      originalname: target === 0 ? 'first.txt' : 'second.txt',
      buffer: Buffer.from(target === 0 ? 'First pending file' : 'Second pending file'),
    }));
  } else expect(mockUploadDocument).not.toHaveBeenCalled();
  expect(getUploadDocumentsForm(submitted(saved.text))).toEqual(expected);
  expect(claim.caseProgression.claimantDocuments).toEqual(expected);
  const redisplay = await request(app).get(url).expect(200);
  expect(getUploadDocumentsForm(submitted(redisplay.text))).toEqual(expected);
  // Non-target multipart files have no saved reference. This documents the
  // existing single-action contract, not protection of all pending selections.
});

const mediationCases = [
  {category: 'documentsForYourStatement', action: 'yourStatement'},
  {category: 'documentsForDocumentsReferred', action: 'documentsReferred'},
] as const;

describe.each([false, true])('mediation multipart preservation (claimant=%s)', claimant => {
  describe.each(mediationCases)('$category', ({category, action}) => {
    it.each([0, 1, 2])('removes row %s, adds and uploads without changing the other collection', async removedIndex => {
      const seed = Object.fromEntries(mediationCases.map(({category: name}) => [name, [0, 1, 2].map(index => row(name, index, metadataFor(name, index)))]));
      const expected = getMediationForm({body: seed} as Request);
      const stored = getMediationForm({body: seed} as Request);
      const claim = dqClaim(claimant);
      claim.caseRole = claimant ? CaseRole.CLAIMANT : CaseRole.DEFENDANT;
      claim.mediationUploadDocuments = new MediationUploads([
        new TypeOfDocuments(1, TypeOfMediationDocuments.YOUR_STATEMENT, true, stored.documentsForYourStatement),
        new TypeOfDocuments(2, TypeOfMediationDocuments.DOCUMENTS_REFERRED_TO_IN_STATEMENT, true, stored.documentsForDocumentsReferred),
      ]);
      (getCaseDataFromStore as jest.Mock).mockResolvedValue(claim);
      const app = appFor(mediationController, claimant ? 'en' : 'cy');
      const url = MEDIATION_UPLOAD_DOCUMENTS.replace(':id', '1645882162449409');
      const initial = await request(app).get(url).expect(200);
      expect(getMediationForm(submitted(initial.text))).toEqual(expected);
      const removed = await post(app, url, initial.text, `${category}[${removedIndex}][removeButton]`).expect(200);
      const survivors = getMediationForm(submitted(removed.text));
      expect(survivors).toEqual({...expected, [category]: expected[category].filter((_, index) => index !== removedIndex)});
      const added = await post(app, url, removed.text, `add_another-${action}`).expect(200);
      const addedModel = getMediationForm(submitted(added.text));
      expect(addedModel[category]).toHaveLength(3);
      expect(addedModel[category][2].caseDocument).toBeUndefined();
      expect({...addedModel, [category]: addedModel[category].slice(0, 2)}).toEqual(survivors);

      const newMetadata = metadataFor(category, 3);
      const saved = await post(app, url, added.text, `${category}[2][uploadButton]`, {category, values: newMetadata})
        .attach(`${category}[2][fileUpload]`, Buffer.from('Safe local text'), 'new.txt').expect(200);
      const expectedFinal = getMediationForm({body: {
        ...seed,
        [category]: [...seed[category].filter((_, index) => index !== removedIndex), {...newMetadata, caseDocument: JSON.stringify(newDocument)}],
      }} as Request);
      expect(getMediationForm(submitted(saved.text))).toEqual(expectedFinal);
      expect(claim.mediationUploadDocuments.typeOfDocuments).toEqual([
        new TypeOfDocuments(1, TypeOfMediationDocuments.YOUR_STATEMENT, true, expectedFinal.documentsForYourStatement),
        new TypeOfDocuments(2, TypeOfMediationDocuments.DOCUMENTS_REFERRED_TO_IN_STATEMENT, true, expectedFinal.documentsForDocumentsReferred),
      ]);
      expect(saveDraftClaim).toHaveBeenLastCalledWith('local-store', claim);
      const redisplay = await request(app).get(url).expect(200);
      expect(getMediationForm(submitted(redisplay.text))).toEqual(expectedFinal);
      const independent = category === 'documentsForYourStatement' ? mediationCases[1] : mediationCases[0];
      const next = await post(app, url, redisplay.text, `add_another-${independent.action}`).expect(200);
      const nextModel = getMediationForm(submitted(next.text));
      expect(nextModel[independent.category]).toHaveLength(4);
      expect({...nextModel, [independent.category]: nextModel[independent.category].slice(0, 3)}).toEqual(expectedFinal);
    });
  });
});

const additionalCategories = [
  ['documentsForDisclosure', 'documents'], ['disclosureList', 'list'],
  ['witnessStatement', 'witnessStatement'], ['witnessSummary', 'summary'],
  ['noticeOfIntention', 'witnessNotice'], ['documentsReferred', 'witnessDocuments'],
  ['expertReport', 'report'], ['expertStatement', 'statement'],
  ['questionsForExperts', 'questions'], ['answersForExperts', 'answer'],
  ['trialCaseSummary', 'case'], ['trialSkeletonArgument', 'skeleton'],
  ['trialAuthorities', 'legal'], ['trialCosts', 'cost'], ['trialDocumentary', 'documentary'],
] as const;

it.each(additionalCategories.flatMap(([category, selection]) => [true, false].map(claimant => ({category, selection, claimant}))))(
  'resumes a sparse saved form and adds $category without losing existing documents (claimant=$claimant)', async ({category, selection, claimant}) => {
    const claim = dqClaim(claimant);
    claim.caseRole = claimant ? CaseRole.CLAIMANT : CaseRole.DEFENDANT;
    const ownKey = claimant ? 'claimantDocuments' : 'defendantDocuments';
    const otherKey = claimant ? 'defendantDocuments' : 'claimantDocuments';
    const selectionKey = claimant ? 'claimantUploadDocuments' : 'defendantUploadDocuments';
    const savedCategory = category === 'disclosureList' ? 'documentsForDisclosure' : 'disclosureList';
    const savedSelection = savedCategory === 'disclosureList' ? 'list' : 'documents';
    const initial = getUploadDocumentsForm({body: {
      [savedCategory]: [0, 1].map(index => row(savedCategory, index, metadataFor(savedCategory, index))),
    }} as Request);
    // A stored form may omit an unselected optional collection. Current multipart parsing
    // supplies empty arrays; the regression specifically resumes an existing sparse draft.
    delete initial[category];
    claim.caseProgression = {
      [selectionKey]: getTypeDocumentForm({body: {[savedSelection]: true}} as Request),
      [ownKey]: initial,
      [otherKey]: getUploadDocumentsForm({body: {disclosureList: [row('other-role', 9, {})]}} as Request),
    };
    const savedBefore = JSON.stringify(initial[savedCategory]);
    const otherBefore = JSON.stringify(claim.caseProgression[otherKey]);
    const persisted: string[] = [];
    (saveDraftClaim as jest.Mock).mockImplementation(async (_key, draft) => {
      persisted.push(JSON.stringify(draft.caseProgression));
    });
    (getClaimById as jest.Mock).mockResolvedValue(claim);
    (getCaseDataFromStore as jest.Mock).mockResolvedValue(claim);
    const routers = Router();
    routers.use(typeOfDocumentsController, controller);
    const app = appFor(routers, claimant ? 'en' : 'cy');
    const id = '1645882162449409';
    const url = CP_UPLOAD_DOCUMENTS_URL.replace(':id', id);
    await request(app).get(url).expect(200);

    await request(app).post(TYPES_OF_DOCUMENTS_URL.replace(':id', id))
      .type('form').send({[savedSelection]: 'on', [selection]: 'on'}).expect(302).expect('Location', url);
    expect(claim.caseProgression[ownKey][category]).toBeUndefined();
    const added = await request(app).get(url).expect(200);
    const rendered = getUploadDocumentsForm(submitted(added.text));
    expect(rendered[category]).toHaveLength(1);
    expect(JSON.stringify(rendered[savedCategory])).toBe(savedBefore);
    const otherParty = claimant ? claim.getDefendantFullName() : claim.getClaimantFullName();
    const metadata = metadataFor(category, 2, otherParty);
    const saved = await post(app, url, added.text, `${category}[0][uploadButton]`, {category, values: metadata, index: 0})
      .attach(`${category}[0][fileUpload]`, Buffer.from('Safe local text'), 'new.txt').expect(200);
    const expected = getUploadDocumentsForm({body: {
      [savedCategory]: initial[savedCategory].map(item => ({...item, caseDocument: JSON.stringify(item.caseDocument)})),
      [category]: [{...metadata, caseDocument: JSON.stringify(newDocument)}],
    }} as Request);
    expect(getUploadDocumentsForm(submitted(saved.text))).toEqual(expected);
    expect(claim.caseProgression[ownKey]).toEqual(expected);
    expect(JSON.stringify(claim.caseProgression[otherKey])).toBe(otherBefore);
    expect(mockUploadDocument).toHaveBeenCalledTimes(1);
    expect(JSON.parse(persisted[persisted.length - 1])).toEqual(JSON.parse(JSON.stringify(claim.caseProgression)));
    const redisplayed = await request(app).get(url).expect(200);
    expect(getUploadDocumentsForm(submitted(redisplayed.text))).toEqual(expected);
  },
);

describe.each([false, true])('check-and-send recovery after dashboard refresh (claimant=%s)', claimant => {
  it.each(['en', 'cy'])('preserves translated evidence and restarts selection without submitting (%s)', async language => {
    jest.requireMock('app/auth/launchdarkly/launchDarklyClient').isCuiGaNroEnabled = jest.fn().mockResolvedValue(false);
    const id = '1645882162449409';
    const role = claimant ? CaseRole.CLAIMANT : CaseRole.DEFENDANT;
    const ownKey = claimant ? 'claimantDocuments' : 'defendantDocuments';
    let cached = dqClaim(claimant);
    cached.id = id;
    cached.caseRole = role;
    cached.responseClaimTrack = 'FAST_CLAIM';
    cached.caseProgression = toCUICaseProgression({} as CCDClaim);
    jest.mocked(getClaimById).mockImplementation(async () => cached);
    jest.mocked(getCaseDataFromStore).mockImplementation(async () => cached);
    const writes: unknown[] = [];
    jest.mocked(saveDraftClaim).mockImplementation(async (_key, claim) => {
      writes.push(JSON.parse(JSON.stringify(claim)));
      cached = claim;
    });
    const router = Router();
    router.use(typeOfDocumentsController, controller, checkAnswersController);
    const app = appFor(router, language);
    const selection = TYPES_OF_DOCUMENTS_URL.replace(':id', id);
    const uploads = CP_UPLOAD_DOCUMENTS_URL.replace(':id', id);
    const check = CP_CHECK_ANSWERS_URL.replace(':id', id);
    await request(app).post(selection).type('form').send({list: 'true'}).expect(302);
    const initial = await request(app).get(uploads).expect(200);
    await post(app, uploads, initial.text, 'disclosureList[0][uploadButton]')
      .attach('disclosureList[0][fileUpload]', Buffer.from('New evidence'), 'new.txt').expect(200);
    const ready = await request(app).get(check + '?lang=' + language).expect(200);
    expect(ready.text).toContain('new.txt');
    expect(cached.caseProgression[ownKey].disclosureList[0].caseDocument.documentName).toBe('new.txt');

    // The backend restores submitted evidence, not the in-progress working form.
    // Use its real translator and the real dashboard cache-refresh utility.
    const ccd = {
      documentDisclosureList: [{id: 'claimant-saved', value: {typeOfDocument: 'Previously submitted claimant evidence', documentUpload: {document_url: '/claimant-saved', document_binary_url: '/claimant-saved/binary', document_filename: 'claimant-saved.pdf'}, createdDatetime: '2024-01-01T12:00:00Z'}}],
      documentDisclosureListRes: [{id: 'defendant-saved', value: {typeOfDocument: 'Previously submitted defendant evidence', documentUpload: {document_url: '/defendant-saved', document_binary_url: '/defendant-saved/binary', document_filename: 'defendant-saved.pdf'}, createdDatetime: '2024-02-02T12:00:00Z'}}],
    } as unknown as CCDClaim;
    const refreshed = dqClaim(claimant);
    refreshed.id = id;
    refreshed.caseRole = role;
    refreshed.responseClaimTrack = 'FAST_CLAIM';
    refreshed.caseProgression = toCUICaseProgression(ccd);
    const client = jest.requireMock('client/civilServiceClient');
    client.retrieveClaimDetails.mockResolvedValue(refreshed);
    const dashboard = jest.requireActual('modules/utilityService').getDashboardClaimById;
    await dashboard(id, {session: {user: {id: 'local-user'}}, cookies: {}} as AppRequest, true);
    expect(cached).toBe(refreshed);
    expect(cached.caseProgression[ownKey]).toBeUndefined();
    expect((cached.caseProgression.claimantUploadDocuments.disclosure[0].caseDocument as UploadEvidenceDocumentType).documentUpload.document_filename).toBe('claimant-saved.pdf');
    expect((cached.caseProgression.defendantUploadDocuments.disclosure[0].caseDocument as UploadEvidenceDocumentType).documentUpload.document_filename).toBe('defendant-saved.pdf');
    const before = JSON.stringify(cached);
    const writesBefore = writes.length;
    await request(app).get(check).expect(302).expect('Location', selection);
    // A stale empty POST may have no parsed body; recovery precedes form access.
    await request(app).post(check).expect(302).expect('Location', selection);
    await request(app).post(check).type('form').send({}).expect(302).expect('Location', selection);
    await request(app).post(check).type('form').send({signed: 'true'}).expect(302).expect('Location', selection);
    expect(client.submitEvent).not.toHaveBeenCalled();
    expect(client.updateTaskStatus).not.toHaveBeenCalled();
    expect(deleteDraftClaimFromStore).not.toHaveBeenCalled();
    expect(writes).toHaveLength(writesBefore);
    expect(JSON.stringify(cached)).toBe(before);
    // Recovery reaches the existing actionable category-selection page.
    const recovered = await request(app).get(selection + '?lang=' + language).expect(200);
    expect(fields(recovered.text).some(([name]) => name === 'list')).toBe(true);
    expect(JSON.stringify(cached)).toBe(before);
  });
});
