import {
  DraftOcmcClaim,
  draftOcmcClaimToDashboardItem,
} from '../../../../../main/common/models/legacyDraftClaim/draftClaim';

describe('draftOcmcClaimToDashboardItem', () => {
  it('should translate ocmc draft claim to dashboard item successfully when ocmc draft claim exists', ()=>{
    //Given
    const draftClaim: DraftOcmcClaim = {
      id: '1',
      document: {
        claimant:{
          partyDetails:{
            name: 'John Smith',
          },
        },
        defendant:{},
      },
    };
    //When
    const dashboardItem = draftOcmcClaimToDashboardItem(draftClaim);
    //Then
    expect(dashboardItem).not.toBeUndefined();
    expect(dashboardItem?.ocmc).toBeTruthy();
    expect(dashboardItem?.draft).toBeTruthy();
    expect(dashboardItem?.claimId).toBe('draft');
  });
  it('should return undefined when ocmc claim is undefined', ()=> {
    //When
    const dashboardItem = draftOcmcClaimToDashboardItem(undefined);
    //Then
    expect(dashboardItem).toBeUndefined();
  });
  it('should return undefined if ocmc claim does not have document defined', ()=> {
    //Given
    const draftClaim: DraftOcmcClaim = {
      id: '1',
    };
    //When
    const dashboardItem = draftOcmcClaimToDashboardItem(draftClaim);
    //Then
    expect(dashboardItem).toBeUndefined();
  });
  it('should return undefined if ocmc claim does not have id', ()=>{
    //Given
    const draftClaim: DraftOcmcClaim = {
      document: {
        claimant:{
          partyDetails:{
            name: 'John Smith',
          },
        },
        defendant:{},
      },
    };
    //When
    const dashboardItem = draftOcmcClaimToDashboardItem(draftClaim);
    //Then
    expect(dashboardItem).toBeUndefined();
  });
});
