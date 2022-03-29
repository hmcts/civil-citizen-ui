import {OtherDependantsService} from '../../../../../main/modules/statementOfMeans/otherDependants/otherDependantsService';
import * as draftStoreService from '../../../../../main/modules/draft-store/draftStoreService';
import {OtherDependants} from '../../../../../main/common/form/models/statementOfMeans/otherDependants';
import { StatementOfMeans } from '../../../../../main/common/models/statementOfMeans';
import { Claim } from '../../../../../main/common/models/claim';
import {app} from '../../../../../main/app';
const civilClaimResponseMock = {
  "id": 1645882162449409,
  "jurisdiction": "CIVIL",
  "case_type_id": "CIVIL",
  "created_date": "2022-03-01T13:29:22.447",
  "last_modified": "2022-03-01T13:29:24.971",
  "state": "PENDING_CASE_ISSUED",
  "security_classification": "PUBLIC",
  "case_data": {
    "claimFee": {
      "code": "FEE0204",
      "version": "4",
      "calculatedAmountInPence": "7000"
    },
    "statementOfMeans": {
      "disability": {
        "option": "yes"
      },
      "partner": {
        "option": "yes"
      },
      "otherDependants": {
        "option": "yes",
        "numberOfPeople": 1,
        "details": "Test details"
      }
    }
  }
}
const civilClaimResponse: string = JSON.stringify(civilClaimResponseMock);
const mockDraftStore = {
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(civilClaimResponse)),
};

jest.mock('../../../../../main/modules/draft-store');
jest.mock('../../../../../main/modules/draft-store/draftStoreService');

describe('otherDependants service', () => {
  it('should return draft claim', async () =>{
    //Given
    const otherDependantsService = new OtherDependantsService();
    const spyGetDraftClaimFromStore = jest.spyOn(draftStoreService, 'getDraftClaimFromStore');
    //When
    const result = await otherDependantsService.getOtherDependants('1645882162449409');
    //Then
    expect(result.option).toBe('');
    expect(result.numberOfPeople).toBeUndefined();
    expect(result.details).toBeUndefined();
    expect(spyGetDraftClaimFromStore).toBeCalled();
  });
  it('should return populated bank accounts rows when data for bank exists', async() =>{
    //Given
    const claim = createClaim();
    const otherDependantsService = new OtherDependantsService();
    const mockGetCaseData = draftStoreService.getDraftClaimFromStore as jest.Mock;
    mockGetCaseData.mockImplementation(async () =>{
      return claim;
    });
    //When
    const result = await otherDependantsService.getOtherDependants('1645882162449409');
    //Then
    expect(result.option).toBe('');
    expect(result.numberOfPeople).toBeUndefined();
    expect(result.details).toBeUndefined();
    expect(mockGetCaseData).toBeCalled();
  });
  it('should save other dependants data to draft store', async () =>{
    //Given
    createClaim();
    const otherDependantsService = new OtherDependantsService();
    // const mockGetCaseData = draftStoreService.getDraftClaimFromStore as jest.Mock;
    // draftStoreService.saveDraftClaim as jest.Mock;
    // mockGetCaseData.mockImplementation(async () =>{
    //   return claim;
    // });
    app.locals.draftStoreClient = mockDraftStore;
    //const spyGet = jest.spyOn(draftStoreService, 'getDraftClaimFromStore');
    const spySave = jest.spyOn(draftStoreService, 'saveDraftClaim');
    const otherDependants: OtherDependants = new OtherDependants('yes', 10, 'Test details', undefined);
    //When
    await otherDependantsService.saveOtherDependants('1645882162449409', otherDependants);
    //Then
    //expect(spyGet).toBeCalled();
    expect(spySave).toBeCalled();
  });
});

function createClaim(){
  const claim = new Claim();
  const statementOfMeans = new StatementOfMeans();
  statementOfMeans.otherDependants = new OtherDependants('yes', 10, 'Test details');
  claim.statementOfMeans = statementOfMeans;
  return claim;
}
