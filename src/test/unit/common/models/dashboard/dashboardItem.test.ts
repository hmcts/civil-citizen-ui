import {
  DashboardClaimantItem,
  DashboardDefendantItem,
  DashboardStatusTranslationParam,
  toDraftClaimDashboardItem,
} from 'common/models/dashboard/dashboardItem';
import { translate } from 'common/models/dashboard/dashboardItem';

import config from 'config';
import {Claim} from 'models/claim';

const ocmcBaseUrl = config.get<string>('services.cmc.url');

jest.mock('../../../../../main/modules/i18n');
jest.mock('../../../../../main/modules/i18n/languageService', ()=> ({
  setLanguage: jest.fn(),
  getLanguage: jest.fn(),
}));
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('Dashboard Items', ()=> {
  describe('Dashboard claimant item', ()=>{
    const ocmcClaimantClaim = new DashboardClaimantItem();
    ocmcClaimantClaim.claimId = '1';
    ocmcClaimantClaim.ocmc = true;

    const ccdClaimantClaim = new DashboardClaimantItem();
    ccdClaimantClaim.claimId = '1';
    ccdClaimantClaim.ocmc = false;

    it('should return correct url for ocmc claim', ()=> {
      //When
      const href = ocmcClaimantClaim.getHref();
      //Then
      expect(href).toEqual(ocmcBaseUrl + '/dashboard/1/claimant');
    });
    it('should return correct url for ccd claims', ()=> {
      //When
      const href = ccdClaimantClaim.getHref();
      //Then
      expect(href).toEqual( '/dashboard/1/claimant');
    });
    it('should translate claim to dashboard item when claim is not empty', () => {
      //Given
      const claim = new Claim();
      claim.draftClaimCreatedAt= new Date();
      //When
      const item = toDraftClaimDashboardItem(claim);
      //Then
      expect(item).not.toBeUndefined();
    });
    it('should return undefined when claim is empty', () => {
      //Given
      const claim = new Claim();
      //When
      const item = toDraftClaimDashboardItem(claim);
      //Then
      expect(item).toBeUndefined();
    });
    it('should return undefined when claim is undefined', () => {
      //When
      const item = toDraftClaimDashboardItem(undefined);
      //Then
      expect(item).toBeUndefined();
    });
  });
  describe('Dashboard defendant item', ()=>{
    const ocmcDefendantClaim = new DashboardDefendantItem();
    ocmcDefendantClaim.claimId = '1';
    ocmcDefendantClaim.ocmc = true;

    const ccdDefendantClaim = new DashboardDefendantItem();
    ccdDefendantClaim.claimId = '1';
    ccdDefendantClaim.ocmc = false;
    it('should return correct url for ocmc claim', ()=> {
      //When
      const href = ocmcDefendantClaim.getHref();
      //Then
      expect(href).toEqual(ocmcBaseUrl + '/dashboard/1/defendant');
    });
    it('should return correct url for ccd claims', ()=> {
      //When
      const href = ccdDefendantClaim.getHref();
      //Then
      expect(href).toEqual( '/dashboard/1/defendant');
    });
    it('should return translated status for claim', () => {
      //Given
      const dashboardClaim = new DashboardDefendantItem();
      dashboardClaim.numberOfDays = '10';
      dashboardClaim.status ='NO_RESPONSE';
      //When
      const status = dashboardClaim.getStatus('en');
      //Then
      expect(status).toBe('PAGES.DASHBOARD.STATUS.NO_RESPONSE_ON_TIME');
    });
    it('should return the translated string without parameters when params is provided but empty', () => {
      // Given
      const translationKey = 'PAGES.DASHBOARD.STATUS.CLAIMANT_CONFIRMED_PAYMENT';
      const expectedTranslation = 'PAGES.DASHBOARD.STATUS.CLAIMANT_CONFIRMED_PAYMENT';
      const params: DashboardStatusTranslationParam[] = [];
      const lang = 'cy';

      // When
      const result = translate(translationKey, params, lang);

      // Then
      expect(result).toBe(expectedTranslation);
    });
  });
});
