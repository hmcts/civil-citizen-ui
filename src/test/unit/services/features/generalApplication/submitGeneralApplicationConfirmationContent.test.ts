import {Claim} from 'models/claim';
import {ClaimSummaryType} from 'form/models/claimSummarySection';
import {
  getCoScGeneralApplicationConfirmationContent, getGeneralApplicationConfirmationContent,
} from 'services/features/generalApplication/submitGeneralApplicationConfirmationContent';
import {getCancelUrl, isConfirmYouPaidCCJAppType} from 'services/features/generalApplication/generalApplicationService';
import {GA_APPLY_HELP_WITH_OUT_APPID_FEE_SELECTION} from 'routes/urls';
import {constructResponseUrlWithIdParams} from 'common/utils/urlFormatter';

jest.mock('i18next', () => ({t: (key: string) => key}));
jest.mock('services/features/generalApplication/generalApplicationService', () => ({
  getCancelUrl: jest.fn(), isConfirmYouPaidCCJAppType: jest.fn(),
}));

const prefix = 'PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.';

describe('GA confirmation content with an explicitly paired application and fee', () => {
  let claim: Claim;
  beforeEach(() => {
    jest.resetAllMocks();
    claim = new Claim();
    // A different linked application's ID and draft fee must not replace the caller's pair.
    claim.generalApplications = [
      {id: 'entry-unrelated', value: {caseLink: {CaseReference: 'ga-unrelated'}}},
      {id: 'entry-selected', value: {caseLink: {CaseReference: 'ga-selected'}}},
    ] as Claim['generalApplications'];
    claim.generalApplication = {applicationFee: {calculatedAmountInPence: 99900}} as Claim['generalApplication'];
    jest.mocked(getCancelUrl).mockResolvedValue('/case/123/cancel/generalApplication');
    jest.mocked(isConfirmYouPaidCCJAppType).mockReturnValue(false);
  });

  it.each(['en', 'cy'])('keeps the supplied application, pounds fee, order and return route for %s', async language => {
    const content = await getGeneralApplicationConfirmationContent('123', 'entry-selected', claim, language, 108);
    expect(getCancelUrl).toHaveBeenCalledWith('123', claim);
    expect(content.map(section => [section.type, section.data.text])).toEqual([
      [ClaimSummaryType.TITLE, prefix + 'WHAT_NEXT'],
      [ClaimSummaryType.PARAGRAPH, prefix + 'APPLICATION_SAVE'],
      [ClaimSummaryType.PARAGRAPH, prefix + 'UNTIL_PAY_FEE'],
      [ClaimSummaryType.PARAGRAPH, prefix + 'APPLY_HELP_WITH_FEES'],
      [ClaimSummaryType.BUTTON, prefix + 'PAY_FEE_BUTTON'],
      [ClaimSummaryType.LINK, prefix + 'RETURN_CASE_DETAILS'],
    ]);
    expect(content[1].data.variables).toEqual({applicationFee: 108});
    expect(content[4].data.href).toBe(
      constructResponseUrlWithIdParams('123', GA_APPLY_HELP_WITH_OUT_APPID_FEE_SELECTION) + '?id=entry-selected&appFee=108',
    );
    expect(content[5].data.href).toBe('/case/123/cancel/generalApplication');
  });

  it('keeps a zero fee as zero rather than falling back to another application fee', async () => {
    const content = await getGeneralApplicationConfirmationContent('123', 'entry-selected', claim, 'en', 0);
    expect(content[1].data.variables).toEqual({applicationFee: 0});
    expect(content[4].data.href).toContain('?id=entry-selected&appFee=0');
  });

  it('selects the certificate-of-satisfaction content using the existing application-type decision', async () => {
    jest.mocked(isConfirmYouPaidCCJAppType).mockReturnValue(true);
    const content = await getGeneralApplicationConfirmationContent('123', 'entry-selected', claim, 'cy', 19);
    expect(isConfirmYouPaidCCJAppType).toHaveBeenCalledWith(claim);
    expect(content.map(section => section.data.text)).toEqual([
      prefix + 'COSC_PAY_FEE', prefix + 'APPLICATION_SAVE', prefix + 'APPLY_HELP_WITH_FEES',
      prefix + 'WHAT_NEXT', prefix + 'COSC_APPLICATION_SUBMITTED', prefix + 'COSC_APPLICATION_SUBMITTED_NEXT',
      prefix + 'PAY_FEE_BUTTON', prefix + 'RETURN_CASE_DETAILS',
    ]);
    expect(content[1].data.variables).toEqual({applicationFee: 19});
    expect(content[6].data.href).toContain('?id=entry-selected&appFee=19');
  });

  it('keeps the dedicated certificate confirmation order and the caller-provided payment identity', async () => {
    const content = await getCoScGeneralApplicationConfirmationContent('123', 'entry-selected', claim, 'en', 19);
    expect(content.map(section => section.data.text)).toEqual([
      prefix + 'COSC_PAY_FEE', prefix + 'APPLICATION_SAVE', prefix + 'APPLY_HELP_WITH_FEES',
      'PAGES.SUBMIT_CONFIRMATION.WHAT_HAPPENS_NEXT', prefix + 'COSC_APPLICATION_SUBMITTED',
      prefix + 'COSC_APPLICATION_SUBMITTED_NEXT', prefix + 'PAY_FEE_BUTTON', prefix + 'RETURN_CASE_DETAILS',
    ]);
    expect(content[6].data.href).toBe(
      constructResponseUrlWithIdParams('123', GA_APPLY_HELP_WITH_OUT_APPID_FEE_SELECTION) + '?id=entry-selected&appFee=19',
    );
    expect(content[7].data.href).toBe('/case/123/cancel/generalApplication');
  });

  it('propagates return-route errors rather than inventing another application route', async () => {
    const failure = new Error('claim unavailable');
    jest.mocked(getCancelUrl).mockRejectedValue(failure);
    await expect(getGeneralApplicationConfirmationContent('123', 'entry-selected', claim, 'en', 108)).rejects.toBe(failure);
  });
});

it.each([
  {id: '', fee: 108}, {id: 'undefined', fee: 108}, {id: 'null', fee: 108},
  {id: 'entry-selected', fee: NaN}, {id: 'entry-selected', fee: Infinity},
  {id: 'entry-selected', fee: -1},
])('rejects invalid direct content inputs rather than constructing an unusable fee link: %p', async ({id, fee}) => {
  jest.mocked(getCancelUrl).mockResolvedValue('/case/123/cancel/generalApplication');
  for (const content of [getGeneralApplicationConfirmationContent, getCoScGeneralApplicationConfirmationContent]) {
    await expect(content('123', id, new Claim(), 'en', fee)).rejects.toMatchObject({status: 400});
  }
});
