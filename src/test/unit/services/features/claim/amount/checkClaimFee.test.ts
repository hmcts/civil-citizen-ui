import {CivilServiceClient} from 'client/civilServiceClient';
import {checkIfClaimFeeHasChanged} from 'services/features/claim/amount/checkClaimFee';
import {mockClaim} from '../../../../../utils/mockClaim';
import nock from 'nock';
import config from 'config';
import {Claim} from 'models/claim';
import {CaseState} from 'form/models/claimDetails';

jest.mock('../../../../../../main/services/features/claim/amount/claimFeesService');
const civilServiceUrl = config.get<string>('services.civilService.url');
describe('Check claim fee is changed service', () => {
  const createDraftClaim = (overrides: Partial<Claim> = {}) => Object.assign(
    Object.create(Object.getPrototypeOf(mockClaim)),
    mockClaim,
    {isDraftClaim: () => true, ccdState: undefined, submittedDate: undefined},
    overrides,
  ) as Claim;
  const createSubmittedClaim = (overrides: Partial<Claim> = {}) => createDraftClaim({
    ccdState: CaseState.PENDING_CASE_ISSUED,
    submittedDate: new Date('2026-07-01T10:00:00'),
    ...overrides,
  });

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
    const isClaimFeeChanged = await checkIfClaimFeeHasChanged('11111', <Claim> { ...mockClaim, ccdState: undefined, submittedDate: undefined, isDraftClaim: () => true, hasInterest:()=> true, isInterestFromASpecificDate:()=> false }, undefined);
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

  describe('when the claim has already been submitted', () => {
    it('Should return false when accrued interest pushes the claim into the next fee band', async () => {
      //Given
      const getClaimFeeData = jest.spyOn(CivilServiceClient.prototype, 'getClaimFeeData').mockResolvedValueOnce({
        calculatedAmountInPence: 11500,
      });
      const submittedClaim = createSubmittedClaim({
        claimFee: {...mockClaim.claimFee, calculatedAmountInPence: 8000},
      } as unknown as Partial<Claim>);
      //When
      const isClaimFeeChanged = await checkIfClaimFeeHasChanged('11111', submittedClaim, undefined);
      //Then
      expect(isClaimFeeChanged).toEqual(false);
      expect(getClaimFeeData).not.toHaveBeenCalled();
    });

    it('Should return false when the fee code has changed since submission', async () => {
      //Given
      jest.spyOn(CivilServiceClient.prototype, 'getClaimFeeData').mockResolvedValueOnce({
        calculatedAmountInPence: 11500,
        code: 'NEW_CODE',
        version: 2,
      });
      const submittedClaim = createSubmittedClaim({
        claimFee: {calculatedAmountInPence: 11500, code: 'OLD_CODE', version: 1},
      } as unknown as Partial<Claim>);
      //When
      const isClaimFeeChanged = await checkIfClaimFeeHasChanged('11111', submittedClaim, undefined);
      //Then
      expect(isClaimFeeChanged).toEqual(false);
    });

    it('Should return false when only the submitted date is known', async () => {
      //Given
      jest.spyOn(CivilServiceClient.prototype, 'getClaimFeeData').mockResolvedValueOnce({calculatedAmountInPence: 11500});
      const submittedClaim = createSubmittedClaim({
        ccdState: undefined,
        claimFee: {...mockClaim.claimFee, calculatedAmountInPence: 8000},
      } as unknown as Partial<Claim>);
      //When
      const isClaimFeeChanged = await checkIfClaimFeeHasChanged('11111', submittedClaim, undefined);
      //Then
      expect(isClaimFeeChanged).toEqual(false);
    });

    it('Should still check the fee when no fee was stored at submission', async () => {
      //Given
      jest.spyOn(CivilServiceClient.prototype, 'getClaimFeeData').mockResolvedValueOnce({calculatedAmountInPence: 11500});
      const submittedClaim = createSubmittedClaim({claimFee: undefined});
      //When
      const isClaimFeeChanged = await checkIfClaimFeeHasChanged('11111', submittedClaim, undefined);
      //Then
      expect(isClaimFeeChanged).toEqual(true);
    });
  });
});
