import {seedUiPreviewFixtures, previewFixtureClock} from 'modules/e2eConfiguration/uiPreviewFixtures';
import {Claim} from 'models/claim';
import {getUiPreviewPageCatalog} from 'services/features/uiPreview/pageCatalog';
import {readFileSync} from 'fs';
import {join} from 'path';
import {addressToHtml} from 'common/utils/addressUtils';
import {getPaidAmount} from 'services/features/claimantResponse/settleClaimService';
import {isConfirmYouPaidCCJAppType} from 'services/features/generalApplication/generalApplicationService';
import {ApplicationTypeOption} from 'models/generalApplication/applicationType';
import {convertToPoundsFilter} from 'common/utils/currencyFormat';
import {JSDOM} from 'jsdom';
import {renderPresentation} from '../../../utils/renderPresentationPages';
import {translateCCDCaseDataToCUIModel} from 'services/translation/convertToCUI/cuiTranslation';
import {getClaimantResponseTaskLists} from 'services/features/claimantResponse/claimantResponseTasklistService/claimantResponseTasklistService';
import {CCDClaim} from 'models/civilClaimResponse';
import {CaseState} from 'form/models/claimDetails';
import {CaseRole} from 'form/models/caseRoles';
import {YesNo} from 'form/models/yesNo';
import {GenericForm} from 'form/models/genericForm';
import {UploadDocumentsForm} from 'form/models/mediation/uploadDocuments/uploadDocumentsForm';
import {getUploadDocuments} from 'services/features/mediation/uploadDocuments/uploadDocumentsService';
import {getYourStatementContent} from 'services/features/mediation/uploadDocuments/yourStatementService';
import {getDocumentsForDocumentsReferred} from 'services/features/mediation/uploadDocuments/documentsForDocumentsReferredService';
import {getMediationSummarySection} from 'services/features/mediation/uploadDocuments/buildYourStatementSummaryRows';

const dataPath = join(__dirname, '../../../../main/modules/e2eConfiguration');
const baseline = JSON.parse(readFileSync(join(dataPath, 'redisData.json'), 'utf8'));
const ga = JSON.parse(readFileSync(join(dataPath, 'gaRedisData.json'), 'utf8'));

const translatedFixture = (mappingFile: string, claimId: string): Claim => {
  const mappings = JSON.parse(readFileSync(join(process.cwd(), 'compose/ui-preview-mappings', mappingFile), 'utf8')).mappings;
  const mapping = mappings.find((entry: {request: {method: string; urlPath?: string}}) =>
    entry.request.method === 'GET' && entry.request.urlPath === `/cases/${claimId}`);
  expect(mapping).toBeDefined();
  const response = mapping.response.jsonBody as {id: string; state: CaseState; case_data: CCDClaim};
  const roleMapping = mappings.find((entry: {request: {method: string; urlPath?: string}}) =>
    entry.request.method === 'GET' && entry.request.urlPath === `/cases/${claimId}/userCaseRoles`);
  expect(roleMapping).toBeDefined();
  const roles = roleMapping.response.jsonBody as CaseRole[];
  expect(roles).toHaveLength(1);
  expect(Object.values(CaseRole)).toContain(roles[0]);
  // CivilServiceClient supplies the separately retrieved role before translation.
  const claim = translateCCDCaseDataToCUIModel({...response.case_data, caseRole: roles[0]});
  claim.id = String(response.id);
  claim.ccdState = response.state;
  return claim;
};

const seededFixture = async (claimId: string): Promise<Claim> => {
  const values = new Map<string, string>();
  await seedUiPreviewFixtures({
    set: async (key, value) => {values.set(key, value);},
    expire: async () => undefined,
  }, baseline, ga, previewFixtureClock('2026-10-20'));
  return Object.assign(new Claim(), JSON.parse(values.get(claimId + 'someID')!).case_data);
};

describe('isolated preview scenarios', () => {
  const original = {...process.env};
  beforeEach(() => {process.env.NODE_ENV = 'e2eTest'; process.env.UI_PREVIEW_ENABLED = 'true';});
  afterEach(() => {process.env = {...original};});

  it.each([
    {claimId: '1645882162449601', mapping: 'ui-preview-full-admit.json', source: 'CCD'},
    {claimId: '1645882162449602', mapping: 'ui-preview-part-admit.json', source: 'CCD'},
    {claimId: '1645882162449601', mapping: 'ui-preview-full-admit.json', source: 'draft'},
    {claimId: '1645882162449602', mapping: 'ui-preview-part-admit.json', source: 'draft'},
  ])('preserves the repayment offer and claimant tasks for $claimId from $source', async ({claimId, mapping, source}) => {
    const claim = source === 'CCD' ? translatedFixture(mapping, claimId) : await seededFixture(claimId);
    expect(claim.id).toBe(claimId);
    expect(claim.isClaimant()).toBe(true);
    const intention = claimId === '1645882162449601'
      ? claim.fullAdmission.paymentIntention : claim.partialAdmission.paymentIntention;
    expect(intention.paymentOption).toBe('INSTALMENTS');
    expect(intention.repaymentPlan).toMatchObject({paymentAmount: 100, repaymentFrequency: 'MONTH'});
    expect(new Date(String(intention.repaymentPlan.firstRepaymentDate)).toISOString()).toBe('2026-09-18T00:00:00.000Z');
    const taskLists = getClaimantResponseTaskLists(claim, claimId, 'en', false, false);
    expect(taskLists.length).toBeGreaterThan(0);
    expect(taskLists[0].tasks.length).toBeGreaterThan(0);
    expect(taskLists.flatMap(group => group.tasks).some(task =>
      task.url === `/case/${claimId}/claimant-response/defendants-response`)).toBe(true);
  });

  it.each(['CCD', 'draft'])('preserves the defendant statement-of-means answers from %s', async source => {
    const claimId = '1645882162449605';
    const claim = source === 'CCD' ? translatedFixture('ui-preview-som.json', claimId) : await seededFixture(claimId);
    expect(claim.isPartialAdmission()).toBe(true);
    expect(claim.isClaimant()).toBe(false);
    expect(claim.isDefendant()).toBe(true);
    expect(claim.partialAdmission.alreadyPaid.option).toBe(YesNo.NO);
    expect(claim.partialAdmission.howMuchDoYouOwe.amount).toBe(400);
    expect(claim.partialAdmission.whyDoYouDisagree.text).toBe('I only owe part of the amount claimed.');
    expect(claim.partialAdmission.paymentIntention.paymentOption).toBe('INSTALMENTS');
  });

  it('retains the mediation agreement identity when the service fixture is translated', () => {
    const claim = translatedFixture('ui-preview-claims.json', '1645882162449409');
    const document = claim.mediationAgreement.document;
    expect(document.document_filename).toBe('mediation-agreement.pdf');
    expect(document.document_url).toMatch(/\/documents\/[^/]+$/);
    expect(document.document_binary_url).toBe(`${document.document_url}/binary`);
  });

  it.each(['en', 'cy'])('provides fresh mediation upload controls and advertises their prerequisites in %s', async language => {
    const before = JSON.stringify([baseline, ga]);
    const claimId = '1645882162449409';
    const claim = await seededFixture(claimId);
    const uploadDocuments = getUploadDocuments(claim);
    expect(uploadDocuments.typeOfDocuments).toEqual([
      {id: 1, type: 'YOUR_STATEMENT', checked: true, uploadDocuments: []},
    ]);
    const form = new GenericForm(new UploadDocumentsForm([], []));
    const dom = new JSDOM(renderPresentation('features/mediation/uploadDocuments/upload-documents.njk', {
      form,
      yourStatementContent: getYourStatementContent(uploadDocuments, form),
      documentsReferredContent: getDocumentsForDocumentsReferred(uploadDocuments, form),
      partyInformation: {claimantName: claim.getClaimantFullName(), defendantName: claim.getDefendantFullName()},
      claimId,
      pageTitle: 'PAGES.UPLOAD_YOUR_DOCUMENTS.TITLE',
      subtitle: 'PAGES.UPLOAD_DOCUMENTS.SUBTITLE',
      paragraph: 'PAGES.MEDIATION.START_PAGE.EACH_DOCUMENT_MUST_WITH_SAVE_FILE',
      sectionTitle: 'PAGES.MEDIATION.UPLOAD_DOCUMENTS.SECTION_TITLE',
      currentUrl: `/case/${claimId}/mediation/upload-documents`,
      backLinkUrl: `/case/${claimId}/mediation/type-of-documents`,
      cancelUrl: `/case/${claimId}/mediation/upload-documents/cancel-document-upload`,
    }, language));
    try {
      const document = dom.window.document;
      expect(document.querySelector('input[type="file"][name="documentsForYourStatement[0][fileUpload]"]')).not.toBeNull();
      expect(document.querySelector('button[value="documentsForYourStatement[0][uploadButton]"]')).not.toBeNull();
      expect(document.querySelector('button[value="add_another-yourStatement"]')).not.toBeNull();
      expect(document.querySelector('input[name="documentsForYourStatement[0][yourName]"]')).not.toBeNull();
    } finally {dom.window.close();}
    expect(getMediationSummarySection(uploadDocuments, claimId, language).sections).toEqual([]);
    expect(JSON.stringify([baseline, ga])).toBe(before);

    const catalog = getUiPreviewPageCatalog();
    const catalogueDom = new JSDOM(renderPresentation('features/ui-preview/index.njk', {catalog}, language));
    try {
      for (const [path, prerequisite] of [
        [`/case/${claimId}/mediation/upload-documents`, 'Select Type of documents'],
        [`/case/${claimId}/mediation/check-and-send`, 'Requires a saved mediation upload draft'],
      ]) {
        const entry = catalog.flatMap(group => group.pages).find(page => page.path === path);
        expect(entry?.status).toBe('prerequisite');
        expect(entry?.notes).toContain(prerequisite);
        expect(catalogueDom.window.document.querySelector(`a[href="${path}"]`)).toBeNull();
        expect(catalogueDom.window.document.querySelector('main')?.textContent).toContain(entry?.notes);
      }
    } finally {catalogueDom.window.close();}
  });

  it('seeds current journey keys without mutating shared fixture objects', async () => {
    const before = JSON.stringify([baseline, ga]); const values = new Map<string, string>();
    const client = {set: jest.fn(async (k: string, v: string) => {values.set(k, v);}), expire: jest.fn(async (): Promise<void> => undefined)};
    await seedUiPreviewFixtures(client, baseline, ga, previewFixtureClock('2026-10-20'));
    expect(JSON.stringify([baseline, ga])).toBe(before);
    for (const [id, role] of [['1645882162449601', '[CLAIMANT]'], ['1645882162449602', '[CLAIMANT]'], ['1645882162449603', '[CLAIMANT]'], ['1645882162449604', '[DEFENDANT]'], ['1645882162449605', '[DEFENDANT]']]) {
      const entry = JSON.parse(values.get(id + 'someID')!);
      expect(entry.case_data.id).toBe(id); expect(entry.case_data.caseRole).toBe(role);
      expect(entry.case_data.respondent1ResponseDeadline).toBe('2027-01-18T12:00:00.000Z');
      expect(client.expire).toHaveBeenCalledWith(id + 'someID', 86400);
      for (const party of ['applicant1', 'respondent1']) {
        const address = entry.case_data[party].partyDetails.primaryAddress;
        expect(address.addressLine1).toBe(party === 'applicant1' ? '1 Claimant Road' : 'Defendant House');
        expect(addressToHtml(address)).toContain(address.addressLine1);
        expect(addressToHtml(address)).toContain(address.postCode);
        expect(address.AddressLine1).toBeUndefined();
      }
    }
    expect(Object.assign(new Claim(), JSON.parse(values.get('someID')!).case_data).isDraftClaim()).toBe(true);
    expect(JSON.parse(values.get('1732194111758649someID')!)).toHaveProperty('generalApplicationType', ['STRIKE_OUT']);
    const full = Object.assign(new Claim(), JSON.parse(values.get('1645882162449601someID')!).case_data);
    expect(full.isFullAdmission()).toBe(true); expect(full.isClaimant()).toBe(true);
    const partial = Object.assign(new Claim(), JSON.parse(values.get('1645882162449602someID')!).case_data);
    expect(partial.isPartialAdmission()).toBe(true);
  });
  it('awaits writes and expiries, and propagates incomplete initialization', async () => {
    let finish: () => void = () => undefined;
    const wait = new Promise<void>(resolve => {finish = resolve;});
    const client = {set: jest.fn(() => wait), expire: jest.fn(async (): Promise<void> => undefined)};
    let done = false; const seeding = seedUiPreviewFixtures(client, baseline, ga).then(() => {done = true;});
    await Promise.resolve(); expect(done).toBe(false); expect(client.expire).not.toHaveBeenCalled();
    finish(); await seeding; expect(done).toBe(true);
    await expect(seedUiPreviewFixtures({set: async () => {throw new Error('seed failed');}, expire: async (): Promise<void> => undefined}, baseline, ga)).rejects.toThrow('seed failed');
  });
  it('does not write additional data when disabled', async () => {
    delete process.env.UI_PREVIEW_ENABLED; const set = jest.fn();
    await expect(seedUiPreviewFixtures({set, expire: jest.fn()}, baseline, ga)).rejects.toThrow('disabled'); expect(set).not.toHaveBeenCalled();
  });
  it('supports a repeatable fixture clock and rejects invalid configuration', () => {
    expect(previewFixtureClock('2026-10-20T01:00Z').toISOString()).toBe('2026-10-20T12:00:00.000Z');
    expect(() => previewFixtureClock('not-a-date')).toThrow();
  });
  it.each(['en', 'cy'])('requires a named business contact before advertising mediation contact confirmation in %s', async language => {
    const values = new Map<string, string>();
    await seedUiPreviewFixtures({
      set: async (key: string, value: string) => {values.set(key, value);},
      expire: async (): Promise<void> => undefined,
    }, baseline, ga, previewFixtureClock('2026-10-20'));
    const claimId = '1645882162449409';
    const claim: Claim = Object.assign(new Claim(), JSON.parse(values.get(claimId + 'someID')!).case_data);
    // The real controller uses the defendant's contact person in this state.
    expect(claim.isClaimantIntentionPending()).toBe(false);
    expect(claim.isBusiness()).toBe(false);
    expect(claim.respondent1.partyDetails.contactPerson).toBeUndefined();
    const catalog = getUiPreviewPageCatalog();
    const path = `/case/${claimId}/mediation/mediation-contact-person`;
    const entry = catalog.flatMap(group => group.pages).find(page => page.path === path);
    expect(entry).toBeDefined();
    expect(entry?.status).toBe('prerequisite');
    expect(entry?.notes).toContain('business-party scenario with a named mediation contact');
    const dom = new JSDOM(renderPresentation('features/ui-preview/index.njk', {catalog}, language));
    try {
      const document = dom.window.document;
      expect(document.querySelector(`a[href="${path}"]`)).toBeNull();
      const row = [...document.querySelectorAll('.ui-preview-catalogue li')]
        .find(item => item.querySelector('span')?.textContent === entry?.title);
      expect(row).toBeDefined();
      expect(row?.querySelector('.govuk-tag')?.textContent?.trim()).toBe('Prerequisite required');
      expect(row?.querySelector('.govuk-hint')?.textContent).toBe(entry?.notes);
    } finally {dom.window.close();}
  });
  it.each(['en', 'cy'])('requires compatible GA scenarios before advertising COSC upload and payment offers in %s', async language => {
    const values = new Map<string, string>();
    await seedUiPreviewFixtures({
      set: async (key: string, value: string) => {values.set(key, value);},
      expire: async (): Promise<void> => undefined,
    }, baseline, ga, previewFixtureClock('2026-10-20'));
    const claimId = '1645882162449604';
    const applicationId = '1732194111758649';
    const claim: Claim = Object.assign(new Claim(), JSON.parse(values.get(claimId + 'someID')!).case_data);
    // The upload controller chooses its caption and POST action from this helper,
    // not from the incoming COSC path.
    expect(claim.generalApplication.applicationTypes.map(type => type.option)).toEqual([ApplicationTypeOption.STRIKE_OUT]);
    expect(isConfirmYouPaidCCJAppType(claim)).toBe(false);

    const mappings = JSON.parse(readFileSync(join(process.cwd(), 'compose/ui-preview-mappings/ui-preview-ga.json'), 'utf8')).mappings;
    const response = mappings.find((mapping: {request: {method: string; urlPath: string}}) =>
      mapping.request.method === 'GET' && mapping.request.urlPath === `/cases/${applicationId}`)?.response.jsonBody;
    expect(response).toBeDefined();
    // The normal response journey offers this page only for a defendant's
    // payment-variation application. The preview response and saved draft agree.
    expect(response.case_data.parentClaimantIsApplicant).toBe('No');
    expect(response.case_data.generalAppType.types).toEqual([ApplicationTypeOption.STRIKE_OUT]);
    expect(response.case_data.generalAppType.types).not.toContain(ApplicationTypeOption.VARY_PAYMENT_TERMS_OF_JUDGMENT);
    expect(response.case_data.generalAppN245FormUpload).toBeUndefined();
    expect(JSON.parse(values.get(applicationId + 'someID')!).generalApplicationType).toEqual([ApplicationTypeOption.STRIKE_OUT]);

    const catalog = getUiPreviewPageCatalog();
    const pages = catalog.flatMap(group => group.pages);
    const dom = new JSDOM(renderPresentation('features/ui-preview/index.njk', {catalog}, language));
    try {
      for (const [path, prerequisite] of [
        [`/case/${claimId}/general-application/cosc/upload-documents`, 'confirm-CCJ-debt-paid application'],
        [`/case/${claimId}/response/general-application/${applicationId}/accept-defendant-offer`, 'application to vary judgment payment terms'],
      ]) {
        const entry = pages.find(page => page.path === path);
        expect(entry).toBeDefined();
        expect(entry?.status).toBe('prerequisite');
        expect(entry?.notes).toContain(prerequisite);
        expect(dom.window.document.querySelector(`a[href="${path}"]`)).toBeNull();
        const row = [...dom.window.document.querySelectorAll('.ui-preview-catalogue li')]
          .find(item => item.querySelector('span')?.textContent === entry?.title);
        expect(row?.querySelector('.govuk-tag')?.textContent?.trim()).toBe('Prerequisite required');
        expect(row?.querySelector('.govuk-hint')?.textContent).toBe(entry?.notes);
      }
      expect(pages.find(page => page.path === `/case/${claimId}/general-application/upload-documents`)?.status).toBe('ready');
      expect(pages.find(page => page.path === `/case/${claimId}/response/general-application/${applicationId}/respondent-agreement`)?.status).toBe('ready');
    } finally {dom.window.close();}
  });
  it.each(['en', 'cy'])('requires a certificate application and fee before advertising COSC guidance in %s', async language => {
    const values = new Map<string, string>();
    await seedUiPreviewFixtures({
      set: async (key: string, value: string) => {values.set(key, value);},
      expire: async (): Promise<void> => undefined,
    }, baseline, ga, previewFixtureClock('2026-10-20'));
    const claimId = '1645882162449604';
    const claim: Claim = Object.assign(new Claim(), JSON.parse(values.get(claimId + 'someID')!).case_data);
    // The guidance controller retains valid existing types. Visiting a COSC
    // path does not turn this strike-out draft or its fee into a certificate.
    expect(claim.generalApplication.applicationTypes.map(type => type.option)).toEqual([ApplicationTypeOption.STRIKE_OUT]);
    expect(isConfirmYouPaidCCJAppType(claim)).toBe(false);
    const mappings = JSON.parse(readFileSync(join(process.cwd(), 'compose/ui-preview-mappings/ui-preview-shared-apis.json'), 'utf8')).mappings;
    const fee = mappings.find((mapping: {request: {method: string; urlPath: string}}) =>
      mapping.request.method === 'POST' && mapping.request.urlPath === '/fees/general-application')?.response.jsonBody;
    expect(fee).toMatchObject({calculatedAmountInPence: 10800, code: 'FEE0442'});
    const guidance = new JSDOM(renderPresentation('features/generalApplication/certOfSorC/ask-proof-debtPayment-guidance.njk', {
      applicationFee: convertToPoundsFilter(fee.calculatedAmountInPence),
    }, language));
    try {
      // This is the incompatible general-application amount the direct page
      // would display, not an assertion of the correct certificate fee.
      expect(guidance.window.document.querySelector('main')?.textContent).toContain('£108');
    } finally {guidance.window.close();}

    const catalog = getUiPreviewPageCatalog();
    const path = `/case/${claimId}/general-application/cosc/ask-proof-of-debt-payment-guidance`;
    const entry = catalog.flatMap(group => group.pages).find(page => page.path === path);
    expect(entry).toBeDefined();
    expect(entry?.status).toBe('prerequisite');
    expect(entry?.notes).toContain('confirm-CCJ-debt-paid application and a compatible certificate fee response');
    const dom = new JSDOM(renderPresentation('features/ui-preview/index.njk', {catalog}, language));
    try {
      expect(dom.window.document.querySelector(`a[href="${path}"]`)).toBeNull();
      const row = [...dom.window.document.querySelectorAll('.ui-preview-catalogue li')]
        .find(item => item.querySelector('span')?.textContent === entry?.title);
      expect(row?.querySelector('.govuk-tag')?.textContent?.trim()).toBe('Prerequisite required');
      expect(row?.querySelector('.govuk-hint')?.textContent).toBe(entry?.notes);
    } finally {dom.window.close();}
  });
  it.each(['en', 'cy'])('requires compatible consent and fee states for GA confirmations in %s', async language => {
    const values = new Map<string, string>();
    await seedUiPreviewFixtures({
      set: async (key: string, value: string) => {values.set(key, value);},
      expire: async (): Promise<void> => undefined,
    }, baseline, ga, previewFixtureClock('2026-10-20'));
    const claimId = '1645882162449604';
    const applicationId = '1732194111758649';
    const claim: Claim = Object.assign(new Claim(), JSON.parse(values.get(claimId + 'someID')!).case_data);
    // checkAnswersController selects the fee-free confirmation only for an
    // agreed hearing adjournment more than 14 days ahead.
    expect(claim.generalApplication.applicationTypes.map(type => type.option)).toEqual([ApplicationTypeOption.STRIKE_OUT]);
    expect(claim.generalApplication.agreementFromOtherParty).toBe('no');
    expect(claim.generalApplication.applicationFee.calculatedAmountInPence).toBe('10800');
    expect(claim.caseProgressionHearing?.hearingDate).toBeUndefined();
    const mappings = JSON.parse(readFileSync(join(process.cwd(), 'compose/ui-preview-mappings/ui-preview-ga.json'), 'utf8')).mappings;
    const response = mappings.find((mapping: {request: {method: string; urlPath: string}}) =>
      mapping.request.method === 'GET' && mapping.request.urlPath === `/cases/${applicationId}`)?.response.jsonBody;
    expect(response).toBeDefined();
    // viewApplicationController chooses respondent-agreement for this service
    // response; agree-to-order requires the other party to have reported consent.
    expect(response.case_data.generalAppRespondentAgreement.hasAgreed).toBe('No');
    expect(response.case_data.generalAppType.types).toEqual([ApplicationTypeOption.STRIKE_OUT]);
    expect(response.case_data.generalAppPBADetails.fee.calculatedAmountInPence).toBe('10800');

    const catalog = getUiPreviewPageCatalog();
    const pages = catalog.flatMap(group => group.pages);
    const dom = new JSDOM(renderPresentation('features/ui-preview/index.njk', {catalog}, language));
    try {
      for (const [path, prerequisite] of [
        [`/case/${claimId}/general-application/application-submitted`, 'completed fee-exempt hearing-adjournment application'],
        [`/case/${claimId}/response/general-application/${applicationId}/agree-to-order`, 'application reporting the other party\'s consent'],
      ]) {
        const entry = pages.find(page => page.path === path);
        expect(entry).toBeDefined();
        expect(entry?.status).toBe('prerequisite');
        expect(entry?.notes).toContain(prerequisite);
        expect(dom.window.document.querySelector(`a[href="${path}"]`)).toBeNull();
        const row = [...dom.window.document.querySelectorAll('.ui-preview-catalogue li')]
          .find(item => item.querySelector('span')?.textContent === entry?.title);
        expect(row?.querySelector('.govuk-tag')?.textContent?.trim()).toBe('Prerequisite required');
        expect(row?.querySelector('.govuk-hint')?.textContent).toBe(entry?.notes);
      }
      expect(pages.find(page => page.path === `/case/${claimId}/response/general-application/${applicationId}/respondent-agreement`)?.status).toBe('ready');
    } finally {dom.window.close();}
  });
  it.each([
    {id: '1645882162449601', page: 'settle-claim', paidAmount: getPaidAmount},
    {id: '1645882162449602', page: 'part-payment-received', paidAmount: (claim: Claim) => claim.getPaidAmount()},
  ])('requires an already-paid scenario for $id/$page', async ({id, page, paidAmount}) => {
    const values = new Map<string, string>();
    await seedUiPreviewFixtures({
      set: async (key: string, value: string) => {values.set(key, value);},
      expire: async (): Promise<void> => undefined,
    }, baseline, ga, previewFixtureClock('2026-10-20'));
    const claim = Object.assign(new Claim(), JSON.parse(values.get(id + 'someID')!).case_data);
    // Use the actual controller's amount contract: admitted money is not paid money.
    expect(paidAmount(claim)).toBeUndefined();
    const entry = getUiPreviewPageCatalog().flatMap(group => group.pages)
      .find(entry => entry.path === `/case/${id}/claimant-response/${page}`);
    expect(entry).toBeDefined();
    expect(entry?.status).toBe('prerequisite');
    expect(entry?.notes).toContain('already-paid scenario with a recorded paid amount');
  });
  it('resolves every candidate route and distinguishes prerequisites/actions', () => {
    const groups = getUiPreviewPageCatalog(); expect(groups.length).toBeGreaterThan(8);
    const pages = groups.flatMap(group => group.pages); expect(pages.length).toBe(316);
    for (const page of pages) {
      expect(page.path).toMatch(/^\/(?!\/)/); expect(page.path).not.toMatch(/[:{}<>\\]/);
      if (page.status !== 'ready') expect(page.notes).toBeTruthy();
    }
    expect(pages.find(page => page.path.includes('testing-support'))?.status).toBe('action');
    for (const path of [
      '/dashboard/1645882162449409/claimantNewDesign',
      '/case/1645882162449601/claimant-response/settle-admitted',
      '/case/1645882162449603/case-progression/check-and-send',
    ]) expect(pages.find(page => page.path === path)?.status).toBe('prerequisite');
    expect(pages.find(page => page.path === '/case/1645882162449602/claimant-response/settle-admitted')?.status).toBe('ready');
  });
});
