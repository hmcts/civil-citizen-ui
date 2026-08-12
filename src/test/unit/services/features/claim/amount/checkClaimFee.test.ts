import {CivilServiceClient} from 'client/civilServiceClient';
import {checkIfClaimFeeHasChanged} from 'services/features/claim/amount/checkClaimFee';
import {mockClaim} from '../../../../../utils/mockClaim';
import nock from 'nock';
import config from 'config';
import {Claim} from 'models/claim';

jest.mock('../../../../../../main/services/features/claim/amount/claimFeesService');
const civilServiceUrl = config.get<string>('services.civilService.url');
describe('Check claim fee is changed service', () => {
  const createDraftClaim = (overrides: Partial<Claim> = {}) => Object.assign(
    Object.create(Object.getPrototypeOf(mockClaim)),
    mockClaim,
    {isDraftClaim: () => true},
    overrides,
  ) as Claim;

  afterEach(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    nock(civilServiceUrl)
      .post('/fees/claim/calculate-interest')
      .reply(200, '100');
    nock(civilServiceUrl)
      .post('/fees/claim/interest')
      .reply(200, '100');
  });

  it('Should return status true if claim fee is changed ', async () => {
    //Given
    const mockClaimFee = {
      calculatedAmountInPence: 5000,
      code: '123',
      version: 1,
    };
    jest.spyOn(CivilServiceClient.prototype, 'getClaimFeeData').mockResolvedValueOnce(mockClaimFee);
    //When
    const isClaimFeeChanged = await checkIfClaimFeeHasChanged('11111', <Claim> { ...mockClaim, isDraftClaim: () => true, hasInterest:()=> true, isInterestFromASpecificDate:()=> false }, undefined);
    //Then
    expect(isClaimFeeChanged).toEqual(true);
  });

  it('Should return status false if claim fee is not changed ', async () => {
    //Given
    const mockClaimFee = {
      calculatedAmountInPence: 11500,
      code: '123',
      version: 1,
    };
    jest.spyOn(CivilServiceClient.prototype, 'getClaimFeeData').mockResolvedValueOnce(mockClaimFee);
    //When
    const isClaimFeeChanged = await checkIfClaimFeeHasChanged('11111', createDraftClaim(), undefined);
    //Then
    expect(isClaimFeeChanged).toEqual(false);
  });

  it('Should return status false if the stored claim fee is the same value as a string', async () => {
    //Given
    const mockClaimFee = {
      calculatedAmountInPence: 11500,
      code: '123',
      version: 1,
    };
    jest.spyOn(CivilServiceClient.prototype, 'getClaimFeeData').mockResolvedValueOnce(mockClaimFee);
    const claimWithStoredStringFee = createDraftClaim({
      claimFee: {
        ...mockClaim.claimFee,
        calculatedAmountInPence: '11500',
      },
    } as unknown as Partial<Claim>);
    //When
    const isClaimFeeChanged = await checkIfClaimFeeHasChanged('11111', claimWithStoredStringFee, undefined);
    //Then
    expect(isClaimFeeChanged).toEqual(false);
  });

  it('Should return status false if neither claim fee is available', async () => {
    //Given
    jest.spyOn(CivilServiceClient.prototype, 'getClaimFeeData').mockResolvedValueOnce({});
    const claimWithoutFee = createDraftClaim({
      claimFee: undefined,
    });
    //When
    const isClaimFeeChanged = await checkIfClaimFeeHasChanged('11111', claimWithoutFee, undefined);
    //Then
    expect(isClaimFeeChanged).toEqual(false);
  });

  it('Should return status true if only the newly calculated claim fee is available', async () => {
    //Given
    jest.spyOn(CivilServiceClient.prototype, 'getClaimFeeData').mockResolvedValueOnce({
      calculatedAmountInPence: 11500,
    });
    const claimWithoutFee = createDraftClaim({
      claimFee: undefined,
    });
    //When
    const isClaimFeeChanged = await checkIfClaimFeeHasChanged('11111', claimWithoutFee, undefined);
    //Then
    expect(isClaimFeeChanged).toEqual(true);
  });

  it('Should return status true if only the stored claim fee is available', async () => {
    //Given
    jest.spyOn(CivilServiceClient.prototype, 'getClaimFeeData').mockResolvedValueOnce({});
    //When
    const isClaimFeeChanged = await checkIfClaimFeeHasChanged('11111', createDraftClaim(), undefined);
    //Then
    expect(isClaimFeeChanged).toEqual(true);
  });
});
