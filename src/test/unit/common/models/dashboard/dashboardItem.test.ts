import {DashboardClaimantItem, DashboardDefendantItem} from '../../../../../main/common/models/dashboard/dashboardItem';
import config from 'config';
const ocmcBaseUrl = config.get<string>('services.cmc.url');
describe('Dashboard Items', ()=> {
  describe('Dashboard claimant item', ()=>{
    it.concurrent('should return correct url for ocmc claim', ()=> {
      //Given
      const ocmcClaim = new DashboardClaimantItem();
      ocmcClaim.claimId = '1';
      ocmcClaim.ocmc = true;
      //When
      const href = ocmcClaim.getHref();
      //Then
      expect(href).toEqual(ocmcBaseUrl + '/dashboard/1/claimant');
    });
    it.concurrent('should return correct url for ccd claims', ()=> {
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
    it.concurrent('should return correct url for ocmc claim', ()=> {
      //Given
      const ocmcClaim = new DashboardDefendantItem();
      ocmcClaim.claimId = '1';
      ocmcClaim.ocmc = true;
      //When
      const href = ocmcClaim.getHref();
      //Then
      expect(href).toEqual(ocmcBaseUrl + '/dashboard/1/defendant');
    });
    it.concurrent('should return correct url for ccd claims', ()=> {
      //Given
      const ocmcClaim = new DashboardDefendantItem();
      ocmcClaim.claimId = '1';
      ocmcClaim.ocmc = false;
      //When
      const href = ocmcClaim.getHref();
      //Then
      expect(href).toEqual( '/dashboard/1/defendant');
    });
  });
});
