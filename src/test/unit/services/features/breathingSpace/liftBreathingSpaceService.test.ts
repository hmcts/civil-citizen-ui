import {getLiftBreathingSpaceForm, saveLiftBreathingSpace} from '../../../../../main/services/features/breathingSpace/liftBreathingSpaceService';
import {saveDraftClaim} from '../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from '../../../../../main/common/models/claim';
import {LiftBreathingSpaceForm} from '../../../../../main/common/form/models/breathingSpace/liftBreathingSpaceForm';

jest.mock('../../../../../main/modules/draft-store/draftStoreService');
const mockSaveDraftClaim = saveDraftClaim as jest.Mock;

describe('Lift Breathing Space Service', () => {
  describe('getLiftBreathingSpaceForm', () => {
    it('should return empty form when no liftBreathing data exists', async () => {
      const claim = new Claim();
      const form = await getLiftBreathingSpaceForm('123', claim);
      expect(form.day).toBeUndefined();
      expect(form.month).toBeUndefined();
      expect(form.year).toBeUndefined();
      expect(form.text).toBeUndefined();
    });

    it('should return populated form when liftBreathing data exists', async () => {
      const claim = new Claim();
      claim.breathingSpace = {
        liftBreathing: {
          expectedEnd: '2023-05-20',
          eventDescription: 'Reason',
        },
      };
      const form = await getLiftBreathingSpaceForm('123', claim);
      expect(form.day).toEqual(20);
      expect(form.month).toEqual(5);
      expect(form.year).toEqual(2023);
      expect(form.text).toBe('Reason');
    });
  });

  describe('saveLiftBreathingSpace', () => {
    it('should save lift breathing space data', async () => {
      const claim = new Claim();
      const form = new LiftBreathingSpaceForm('2023', '05', '20', 'Reason');
      await saveLiftBreathingSpace('123', claim, form);
      expect(claim.breathingSpace?.liftBreathing?.expectedEnd).toContain('2023-05-');
      expect(claim.breathingSpace?.liftBreathing?.eventDescription).toBe('Reason');
      expect(mockSaveDraftClaim).toHaveBeenCalledWith('123', claim);
    });

    it('should initialize breathingSpace if it does not exist', async () => {
      const claim = new Claim();
      const form = new LiftBreathingSpaceForm('2023', '5', '20', 'Reason');
      await saveLiftBreathingSpace('123', claim, form);
      expect(claim.breathingSpace).toBeDefined();
      expect(claim.breathingSpace?.liftBreathing).toBeDefined();
    });
  });
});
