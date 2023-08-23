import {getBundlesContent} from 'services/features/caseProgression/bundles/bundlesService';
import {Claim} from 'models/claim';
import {CaseProgression} from 'models/caseProgression/caseProgression';
import {Bundle} from 'models/caseProgression/bundles/bundle';
import {t} from 'i18next';
import {CASE_DOCUMENT_VIEW_URL} from 'routes/urls';

jest.mock('i18next');
const mockTranslate = t as jest.Mock;

const lang = 'en';

describe('getBundlesContent', () =>{

  const caseData = new Claim();
  caseData.id = '1234';
  caseData.caseProgression = new CaseProgression();

  const title = 'Trial Bundle';
  const binary = '77121e9b-e83a-440a-9429-e7f0fe89e518';

  const document = {document_filename: 'name', document_url: 'url', document_binary_url:`http://dm-store:8080/documents/${binary}/binary`};
  const creationDate = new Date('01-01-2023');
  const hearingDate = new Date('01-01-2022');

  const documentUrl = CASE_DOCUMENT_VIEW_URL.replace(':id', '1234').replace(':documentId', binary);
  const documentUrlElement = `<a class="govuk-link" target="_blank" href="${documentUrl}">${document.document_filename}</a>`;

  const bundle = new Bundle(title, document, creationDate, hearingDate);
  const bundleWithoutDocument = new Bundle(title, null, creationDate, hearingDate);
  const bundleWithoutCreatedOn = new Bundle(title, document, null, hearingDate);

  it('bundle info should be displayed if bundles != 0', () => {
    //given
    const caseData = new Claim();
    caseData.id = '1234';
    caseData.caseProgression = new CaseProgression();
    const bundles = [] as Bundle[];

    bundles.push(bundle);
    bundles.push(bundle);
    caseData.caseProgression.caseBundles = bundles;

    mockTranslate.mockReturnValue('Table header text');

    //when
    const bundleTabActual = getBundlesContent(caseData, lang);

    //then
    expect(bundleTabActual[0].contentSections[0].data.text).toMatch('PAGES.CLAIM_SUMMARY.BUNDLES.FIND_BUNDLE_BELOW');
    expect(bundleTabActual[0].contentSections[1].data.textBefore).toMatch('PAGES.CLAIM_SUMMARY.BUNDLES.APPLY_TO_COURT_BEFORE');
    expect(bundleTabActual[0].contentSections[1].data.text).toMatch('PAGES.CLAIM_SUMMARY.BUNDLES.APPLY_TO_COURT_LINK');
    expect(bundleTabActual[0].contentSections[1].data.textAfter).toMatch('PAGES.CLAIM_SUMMARY.BUNDLES.APPLY_TO_COURT_AFTER');
    expect(bundleTabActual[0].contentSections[2].data.text).toMatch('PAGES.CLAIM_SUMMARY.BUNDLES.NEW_DOCUMENT_NOT_INCLUDED');
    expect(bundleTabActual[0].contentSections[3].data.head[0].html).toMatch('Table header text');
    expect(bundleTabActual[0].contentSections[3].data.head[1].html).toMatch('Table header text');
    expect(bundleTabActual[0].contentSections[3].data.head[2].html).toMatch('Table header text');
    expect(bundleTabActual[0].contentSections[3].data.head[3].html).toMatch('Table header text');
    expect(bundleTabActual[0].contentSections[3].data.tableRows[0][0].html).toMatch(title);
    expect(bundleTabActual[0].contentSections[3].data.tableRows[0][1].html).toMatch(bundle.getFormattedCreatedOn);
    expect(bundleTabActual[0].contentSections[3].data.tableRows[0][2].html).toMatch(bundle.getFormattedHearingDate);
    expect(bundleTabActual[0].contentSections[3].data.tableRows[0][3].html).toMatch(documentUrlElement);
    expect(bundleTabActual[0].contentSections[3].data.tableRows[1][0].html).toMatch(title);
    expect(bundleTabActual[0].contentSections[3].data.tableRows[1][1].html).toMatch(bundle.getFormattedCreatedOn);
    expect(bundleTabActual[0].contentSections[3].data.tableRows[1][2].html).toMatch(bundle.getFormattedHearingDate);
    expect(bundleTabActual[0].contentSections[3].data.tableRows[1][3].html).toMatch(documentUrlElement);
  });

  it('bundle lrow should not be displayed if bundle does not contain stitchedDocument', () => {
    //given
    const bundles = [] as Bundle[];
    bundles.push(bundle);
    bundles.push(bundleWithoutDocument);
    caseData.caseProgression.caseBundles = bundles;

    mockTranslate.mockReturnValue('Table header text');

    //when
    const bundleTabActual = getBundlesContent(caseData, lang);

    //then
    expect(bundleTabActual[0].contentSections[0].data.text).toMatch('PAGES.CLAIM_SUMMARY.BUNDLES.FIND_BUNDLE_BELOW');
    expect(bundleTabActual[0].contentSections[1].data.textBefore).toMatch('PAGES.CLAIM_SUMMARY.BUNDLES.APPLY_TO_COURT_BEFORE');
    expect(bundleTabActual[0].contentSections[1].data.text).toMatch('PAGES.CLAIM_SUMMARY.BUNDLES.APPLY_TO_COURT_LINK');
    expect(bundleTabActual[0].contentSections[1].data.textAfter).toMatch('PAGES.CLAIM_SUMMARY.BUNDLES.APPLY_TO_COURT_AFTER');
    expect(bundleTabActual[0].contentSections[2].data.text).toMatch('PAGES.CLAIM_SUMMARY.BUNDLES.NEW_DOCUMENT_NOT_INCLUDED');
    expect(bundleTabActual[0].contentSections[3].data.head[0].html).toMatch('Table header text');
    expect(bundleTabActual[0].contentSections[3].data.head[1].html).toMatch('Table header text');
    expect(bundleTabActual[0].contentSections[3].data.head[2].html).toMatch('Table header text');
    expect(bundleTabActual[0].contentSections[3].data.head[3].html).toMatch('Table header text');
    expect(bundleTabActual[0].contentSections[3].data.tableRows[0][0].html).toMatch(title);
    expect(bundleTabActual[0].contentSections[3].data.tableRows[0][1].html).toMatch(bundle.getFormattedCreatedOn);
    expect(bundleTabActual[0].contentSections[3].data.tableRows[0][2].html).toMatch(bundle.getFormattedHearingDate);
    expect(bundleTabActual[0].contentSections[3].data.tableRows[0][3].html).toMatch(documentUrlElement);
    expect(bundleTabActual[0].contentSections[3].data.tableRows[1]).toBeUndefined();
  });

  it('bundle row should not be displayed if bundle does not contain createdOn', () => {
    //given
    const bundles = [] as Bundle[];
    bundles.push(bundle);
    bundles.push(bundleWithoutCreatedOn);
    caseData.caseProgression.caseBundles = bundles;

    mockTranslate.mockReturnValue('Table header text');

    //when
    const bundleTabActual = getBundlesContent(caseData, lang);

    //then
    expect(bundleTabActual[0].contentSections[0].data.text).toMatch('PAGES.CLAIM_SUMMARY.BUNDLES.FIND_BUNDLE_BELOW');
    expect(bundleTabActual[0].contentSections[1].data.textBefore).toMatch('PAGES.CLAIM_SUMMARY.BUNDLES.APPLY_TO_COURT_BEFORE');
    expect(bundleTabActual[0].contentSections[1].data.text).toMatch('PAGES.CLAIM_SUMMARY.BUNDLES.APPLY_TO_COURT_LINK');
    expect(bundleTabActual[0].contentSections[1].data.textAfter).toMatch('PAGES.CLAIM_SUMMARY.BUNDLES.APPLY_TO_COURT_AFTER');
    expect(bundleTabActual[0].contentSections[2].data.text).toMatch('PAGES.CLAIM_SUMMARY.BUNDLES.NEW_DOCUMENT_NOT_INCLUDED');
    expect(bundleTabActual[0].contentSections[3].data.head[0].html).toMatch('Table header text');
    expect(bundleTabActual[0].contentSections[3].data.head[1].html).toMatch('Table header text');
    expect(bundleTabActual[0].contentSections[3].data.head[2].html).toMatch('Table header text');
    expect(bundleTabActual[0].contentSections[3].data.head[3].html).toMatch('Table header text');
    expect(bundleTabActual[0].contentSections[3].data.tableRows[0][0].html).toMatch(title);
    expect(bundleTabActual[0].contentSections[3].data.tableRows[0][1].html).toMatch(bundle.getFormattedCreatedOn);
    expect(bundleTabActual[0].contentSections[3].data.tableRows[0][2].html).toMatch(bundle.getFormattedHearingDate);
    expect(bundleTabActual[0].contentSections[3].data.tableRows[0][3].html).toMatch(documentUrlElement);
    expect(bundleTabActual[0].contentSections[3].data.tableRows[1]).toBeUndefined();
  });

  it('if no bundles, could show tab info with bundle missing', () => {
    //given
    const caseData = new Claim();
    caseData.caseProgression = new CaseProgression();

    mockTranslate.mockReturnValue('Table header text');

    //when
    const bundleTabActual = getBundlesContent(caseData, lang);

    //then
    expect(bundleTabActual[0].contentSections[0].data.text).toMatch('PAGES.CLAIM_SUMMARY.BUNDLES.FIND_BUNDLE_BELOW');
    expect(bundleTabActual[0].contentSections[1].data.textBefore).toMatch('PAGES.CLAIM_SUMMARY.BUNDLES.APPLY_TO_COURT_BEFORE');
    expect(bundleTabActual[0].contentSections[1].data.text).toMatch('PAGES.CLAIM_SUMMARY.BUNDLES.APPLY_TO_COURT_LINK');
    expect(bundleTabActual[0].contentSections[1].data.textAfter).toMatch('PAGES.CLAIM_SUMMARY.BUNDLES.APPLY_TO_COURT_AFTER');
    expect(bundleTabActual[0].contentSections[2].data.text).toMatch('PAGES.CLAIM_SUMMARY.BUNDLES.NEW_DOCUMENT_NOT_INCLUDED');
    expect(bundleTabActual[0].contentSections[3].data.head[0].html).toMatch('Table header text');
    expect(bundleTabActual[0].contentSections[3].data.head[1].html).toMatch('Table header text');
    expect(bundleTabActual[0].contentSections[3].data.head[2].html).toMatch('Table header text');
    expect(bundleTabActual[0].contentSections[3].data.head[3].html).toMatch('Table header text');
    expect(bundleTabActual[0].contentSections[3].data.tableRows).toBeNull();
  });
});
