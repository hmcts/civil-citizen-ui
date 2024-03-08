import {replaceDashboardPlaceholders} from 'services/dashboard/dashboardInterpolationService';
import {Claim} from 'models/claim';
import {addDaysToDate} from 'common/utils/dateUtils';

describe('dashboardInterpolationService', () => {
  const textToReplaceDynamic = 'You have {daysLeftToRespond} days left.';
  const textToReplaceUrl = '{VIEW_CLAIM_URL}';
  const textToReplaceRedirect = '{VIEW_DOCUMENT_DRAFT}';

  it('should replace placeholders with values when found', () => {

    const claim: Claim = new Claim();
    const currentDate = new Date();
    claim.respondent1ResponseDeadline = addDaysToDate(currentDate, 28);

    const textReplacedDynamic = replaceDashboardPlaceholders(textToReplaceDynamic, claim, '123');
    const textExpectedDynamic = 'You have 28 days left.';

    const textReplacedUrl = replaceDashboardPlaceholders(textToReplaceUrl, claim, '123');
    const textExpectedUrl = '#';

    expect(textReplacedDynamic).toEqual(textExpectedDynamic);
    expect(textReplacedUrl).toEqual(textExpectedUrl);
  });

  it('should replace placeholders with redirect when notificationId is present', () => {

    const claim: Claim = new Claim();
    claim.id = '123';
    const currentDate = new Date();
    claim.respondent1ResponseDeadline = addDaysToDate(currentDate, 28);

    const textReplacedRedirect = replaceDashboardPlaceholders(textToReplaceRedirect, claim, '123','456');

    const textExpectedRedirect = '/notification/456/redirect/VIEW_DOCUMENT_DRAFT/123';

    expect(textReplacedRedirect).toEqual(textExpectedRedirect);
  });

  it('should replace dynamic text with nothing when claim is empty', () => {
    const claim: Claim = new Claim();

    const textReplacedDynamic = replaceDashboardPlaceholders(textToReplaceDynamic, claim, '123');
    const textExpectedDynamic = 'You have  days left.';

    expect(textReplacedDynamic).toEqual(textExpectedDynamic);
  });

  it('should replace dynamic text with nothing when claim is undefined', () => {
    const claim: Claim = new Claim();

    const textReplacedDynamic = replaceDashboardPlaceholders(textToReplaceDynamic, claim, '123');
    const textExpectedDynamic = 'You have  days left.';

    expect(textReplacedDynamic).toEqual(textExpectedDynamic);

  });

});
