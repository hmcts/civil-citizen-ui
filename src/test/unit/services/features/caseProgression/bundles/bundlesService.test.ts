import {getBundlesContent} from 'services/features/caseProgression/bundles/bundlesService';
import {Claim} from 'models/claim';
import {CaseProgression} from 'models/caseProgression/caseProgression';
import {Bundle} from 'models/caseProgression/bundles/bundle';
import {t} from 'i18next';
import {formatStringDateDMY, formatStringTimeHMS} from 'common/utils/dateUtils';
import {CASE_DOCUMENT_DOWNLOAD_URL} from 'routes/urls';

jest.mock('i18next');
const mockTranslate = t as jest.Mock;

const lang = 'en';

describe('getBundlesContent', () =>{

  it('bundle info should be displayed if bundles != 0', () => {
    //given
    const caseData = new Claim();
    caseData.id = '1234';
    caseData.caseProgression = new CaseProgression();
    const bundles = [] as Bundle[];

    const title = 'Trial Bundle';
    const document = {document_filename: 'name', document_url: 'url', document_binary_url:'binary_url'};
    const creationDate = new Date('01-01-2023');
    const hearingDate = new Date('01-01-2022');

    const bundle = new Bundle(title, document, creationDate, hearingDate);
    bundles.push(bundle);
    caseData.caseProgression.caseBundles = bundles;

    const creationDateFormatted = formatStringDateDMY(creationDate);
    const creationTimeFormatted = formatStringTimeHMS(creationDate);
    const creationFullFormatted = `${creationDateFormatted}, ${creationTimeFormatted}`;
    const hearingDateFormatted = formatStringDateDMY(hearingDate);
    const documentUrl = CASE_DOCUMENT_DOWNLOAD_URL.replace(':id', '1234').replace(':documentId', document.document_binary_url);
    const documentUrlElement = `<a class="govuk-link" href="${documentUrl}">${document.document_filename}</a>`;

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
    expect(bundleTabActual[0].contentSections[3].data.tableRows[0][1].html).toMatch(creationFullFormatted);
    expect(bundleTabActual[0].contentSections[3].data.tableRows[0][2].html).toMatch(hearingDateFormatted);
    expect(bundleTabActual[0].contentSections[3].data.tableRows[0][3].html).toMatch(documentUrlElement);
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
