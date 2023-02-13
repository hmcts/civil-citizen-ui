import {DashboardClaimantItem, DashboardDefendantItem} from 'common/models/dashboard/dashboardItem';
import config from 'config';
const ocmcBaseUrl = config.get<string>('services.cmc.url');

jest.mock('../../../../../main/modules/i18n');
jest.mock('i18next', () => ({
  t: (i: string | unknown) => i,
  use: jest.fn(),
}));

describe('Dashboard Items', ()=> {
  describe('Dashboard claimant item', ()=>{
    it('should return correct url for ocmc claim', ()=> {
      //Given
      const ocmcClaim = new DashboardClaimantItem();
      ocmcClaim.claimId = '1';
      ocmcClaim.ocmc = true;
      //When
      const href = ocmcClaim.getHref();
      //Then
      expect(href).toEqual(ocmcBaseUrl + '/dashboard/1/claimant');
    });
    it('should return correct url for ccd claims', ()=> {
      //Given
      const ocmcClaim = new DashboardClaimantItem();
      ocmcClaim.claimId = '1';
      ocmcClaim.ocmc = false;
      //When
      const href = ocmcClaim.getHref();
      //Then
      expect(href).toEqual( '/dashboard/1/claimant');
    });
  });
  describe('Dashboard defendant item', ()=>{
    it('should return correct url for ocmc claim', ()=> {
      //Given
      const ocmcClaim = new DashboardDefendantItem();
      ocmcClaim.claimId = '1';
      ocmcClaim.ocmc = true;
      //When
      const href = ocmcClaim.getHref();
      //Then
      expect(href).toEqual(ocmcBaseUrl + '/dashboard/1/defendant');
    });
    it('should return correct url for ccd claims', ()=> {
      //Given
      const ccdClaim = new DashboardDefendantItem();
      ccdClaim.claimId = '1';
      ccdClaim.ocmc = false;
      //When
      const href = ccdClaim.getHref();
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
  });
});
