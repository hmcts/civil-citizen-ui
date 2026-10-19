import express, {Request, Response, Router} from 'express';
import request from 'supertest';
import controller from 'routes/features/caseProgression/uploadDocumentsController';
import mediationController from 'routes/features/mediation/uploadDocuments/uploadDocumentsController';
import {MEDIATION_UPLOAD_DOCUMENTS} from 'routes/urls';
import {UploadDocuments as MediationUploads, TypeOfDocuments, TypeOfMediationDocuments} from 'models/mediation/uploadDocuments/uploadDocuments';
import {getUploadDocumentsForm as getMediationForm} from 'services/features/mediation/uploadDocuments/uploadDocumentsService';
import {CP_UPLOAD_DOCUMENTS_URL} from 'routes/urls';
import {getClaimById} from 'modules/utilityService';
import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {CaseRole} from 'form/models/caseRoles';
import {getTypeDocumentForm, getUploadDocumentsForm} from 'services/features/caseProgression/caseProgressionService';
import {renderUploadPage} from '../../../test/utils/renderUploadForms';
import {dqClaim} from '../../../test/utils/renderDqRepeatedRows';
const {JSDOM} = require('jsdom');
const qs = require('qs');
jest.mock('modules/draft-store/draftStoreService', () => ({getCaseDataFromStore: jest.fn(), saveDraftClaim: jest.fn(), generateRedisKey: jest.fn(() => 'local-store')}));
jest.mock('modules/utilityService', () => ({getClaimById: jest.fn()}));
jest.mock('client/civilServiceClient', () => {
  const uploadDocument = jest.fn(async () => ({documentName: 'new.txt', documentLink: {document_url: '/new', document_binary_url: '/new/binary', document_filename: 'new.txt'}}));
  return {CivilServiceClient: jest.fn().mockImplementation(() => ({uploadDocument})), uploadDocument};
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
  app.use((req, res, next) => {
    req.session = {user: {id: 'local-user'}, save: (callback: () => void) => callback()} as unknown as Request['session'];
    req.cookies = {};
    // The actual GET/POST controller supplies the content and page variables.
    // The helper substitutes the outer shell and supplies translations/CSRF.
    res.render = ((view: string, values: Record<string, unknown>) => res.send(renderUploadPage(view + '.njk', language, values))) as unknown as Response['render'];
    next();
  });
  app.use(router);
  return app;
}

function post(app: ReturnType<typeof express>, url: string, html: string, action: string, metadata?: {category: string; values: Metadata}) {
  const values = fields(html);
  function set(name: string, value: string) {
    const matches = values.filter(([field]) => field === name);
    expect(matches).toHaveLength(1);
    matches[0][1] = value;
  }
  if (metadata) for (const [key, value] of Object.entries(metadata.values)) {
    const prefix = `${metadata.category}[2][${key}]`;
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
    case 'documentsForDocumentsReferred':
      return {typeOfDocument: `Description ${index}`, dateInputFields};
    case 'documentsReferred':
      return {typeOfDocument: `Description ${index}`, witnessName: `Witness ${index}`, dateInputFields};
    case 'expertReport':
      return {expertName: `Expert ${index}`, fieldOfExpertise: `Specialism ${index}`, dateInputFields};
    case 'questionsForExperts':
      return {expertName: `Expert ${index}`, otherPartyName: otherParty, questionDocumentName: `Question ${index}`};
    case 'answersForExperts':
      return {expertName: `Expert ${index}`, otherPartyName: otherParty, otherPartyQuestionsDocumentName: `Answer ${index}`};
    case 'documentsForYourStatement':
      return {yourName: `Person ${index}`, dateInputFields};
    case 'disclosureList':
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
