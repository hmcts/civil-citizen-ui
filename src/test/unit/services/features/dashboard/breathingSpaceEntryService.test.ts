import {Claim} from 'models/claim';
import {BreathingSpaceType} from 'models/breathingSpace/breathingSpaceType';
import {BreathingSpaceTypeAndReference} from 'models/breathingSpace/breathingSpaceTypeAndReference';
import {
  getBreathingSpaceTypeAndReferenceForm,
  saveBreathingSpaceTypeAndReference,
} from 'services/features/dashboard/breathingSpaceEntryService';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'models/AppRequest';

jest.mock('modules/draft-store/draftStoreService');

describe('breathingSpaceEntryService', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should map claim data to type and reference form', () => {
    const claim = new Claim();
    claim.breathingSpaceTypeAndReference = new BreathingSpaceTypeAndReference(
      BreathingSpaceType.STANDARD,
      'ABC',
    );
    const form = getBreathingSpaceTypeAndReferenceForm(claim);
    expect(form.type).toBe(BreathingSpaceType.STANDARD);
    expect(form.reference).toBe('ABC');
  });

  it('should save type and reference onto claim', async () => {
    const claim = new Claim();
    (draftStoreService.generateRedisKey as jest.Mock).mockReturnValue('key');
    (draftStoreService.getCaseDataFromStore as jest.Mock).mockResolvedValue(claim);
    (draftStoreService.saveDraftClaim as jest.Mock).mockResolvedValue(undefined);

    const form = new BreathingSpaceTypeAndReference(BreathingSpaceType.MENTAL_HEALTH, 'REF');
    await saveBreathingSpaceTypeAndReference(
      {session: {user: {id: 'user'}}} as AppRequest,
      form,
    );

    expect(claim.breathingSpaceTypeAndReference).toBe(form);
    expect(draftStoreService.saveDraftClaim).toHaveBeenCalledWith('key', claim);
  });
});
