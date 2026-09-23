import {getBreathingSpaceEnterStartDate, getLiftBreathingSpaceForm, saveLiftBreathingSpace} from '../../../../../main/services/features/breathingSpace/liftBreathingSpaceService';
import {saveDraftClaim} from '../../../../../main/modules/draft-store/draftStoreService';
import {Claim} from '../../../../../main/common/models/claim';
import {getDefaultStandardLiftEndDate, LiftBreathingSpaceForm} from '../../../../../main/common/form/models/breathingSpace/liftBreathingSpaceForm';
import {BreathingSpaceEnterInfo} from '../../../../../main/common/models/breathingSpace/breathingSpaceEnterInfo';
import {BreathingSpaceType} from '../../../../../main/common/models/breathingSpace/breathingSpaceType';

jest.mock('../../../../../main/modules/draft-store/draftStoreService');
const mockSaveDraftClaim = saveDraftClaim as jest.Mock;

describe('Lift Breathing Space Service', () => {
  describe('getBreathingSpaceEnterStartDate', () => {
    it('should return enterBreathing start date at start of day', () => {
      const claim = new Claim();
      claim.enterBreathing = new BreathingSpaceEnterInfo(
        BreathingSpaceType.STANDARD,
        undefined,
        new Date('2024-06-15T15:30:00'),
      );
      const startDate = getBreathingSpaceEnterStartDate(claim);
      expect(startDate.getFullYear()).toBe(2024);
      expect(startDate.getMonth()).toBe(5);
      expect(startDate.getDate()).toBe(15);
      expect(startDate.getHours()).toBe(0);
    });

    it('should return today when enterBreathing start is missing', () => {
      const claim = new Claim();
      const startDate = getBreathingSpaceEnterStartDate(claim);
      const today = new Date();
      expect(startDate.getFullYear()).toBe(today.getFullYear());
      expect(startDate.getMonth()).toBe(today.getMonth());
      expect(startDate.getDate()).toBe(today.getDate());
    });
  });

  describe('getLiftBreathingSpaceForm', () => {
    it('should set startDate from enterBreathing when building form', async () => {
      const claim = new Claim();
      claim.enterBreathing = new BreathingSpaceEnterInfo(
        BreathingSpaceType.STANDARD,
        undefined,
        new Date('2024-06-01'),
      );
      const form = await getLiftBreathingSpaceForm('123', claim);
      expect(form.startDate).toEqual(new Date('2024-06-01T00:00:00'));
      expect(form.breathingSpaceType).toBe(BreathingSpaceType.STANDARD);
      const expectedEnd = getDefaultStandardLiftEndDate(new Date('2024-06-01T00:00:00'));
      expect(form.day).toBe(expectedEnd.getDate());
      expect(form.month).toBe(expectedEnd.getMonth() + 1);
      expect(form.year).toBe(expectedEnd.getFullYear());
    });

    it('should return empty end date when no liftBreathing data and type is not standard', async () => {
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
