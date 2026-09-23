import {Claim} from 'models/claim';
import {BreathingSpaceType} from 'models/breathingSpace/breathingSpaceType';
import {BreathingSpaceEnterDraft} from 'models/breathingSpace/breathingSpaceEnterDraft';
import {BreathingSpaceStartDate} from 'models/breathingSpace/breathingSpaceStartDate';
import {
  cancelBreathingSpaceEntry,
  getBreathingSpaceCheckAnswersRows,
  getBreathingSpaceConfirmationNextContent,
  getBreathingSpaceConfirmationPanelTitle,
  getBreathingSpaceStartDateForm,
  getBreathingSpaceEnterDraftForm,
  resolveBreathingSpaceStartDate,
  saveBreathingSpaceStartDate,
  saveBreathingSpaceEnterDraft,
} from 'services/features/dashboard/breathingSpaceEntryService';
import * as draftStoreService from 'modules/draft-store/draftStoreService';
import {AppRequest} from 'models/AppRequest';
import {
  BREATHING_SPACE_ENTER_URL,
  BREATHING_SPACE_START_DATE_URL,
} from 'routes/urls';

jest.mock('modules/draft-store/draftStoreService');
jest.mock('i18next', () => ({
  t: (key: string) => key,
}));

describe('breathingSpaceEntryService', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should map claim data to type and reference form', () => {
    const claim = new Claim();
    claim.breathingSpaceEnterDraft = new BreathingSpaceEnterDraft(
      BreathingSpaceType.STANDARD,
      'ABC',
    );
    const form = getBreathingSpaceEnterDraftForm(claim);
    expect(form.type).toBe(BreathingSpaceType.STANDARD);
    expect(form.reference).toBe('ABC');
    expect(form.expectedEnd).toBeNull();
  });

  it('should map saved start date to form fields', () => {
    const claim = new Claim();
    claim.breathingSpaceEnterDraft = new BreathingSpaceEnterDraft(
      BreathingSpaceType.STANDARD,
      'ABC',
      new Date(2024, 0, 15),
    );
    const form = getBreathingSpaceStartDateForm(claim);
    expect(form.day).toBe(15);
    expect(form.month).toBe(1);
    expect(form.year).toBe(2024);
  });

  it('should default blank start date to today', () => {
    const today = new Date();
    const start = resolveBreathingSpaceStartDate(new BreathingSpaceStartDate());
    expect(start.getFullYear()).toBe(today.getFullYear());
    expect(start.getMonth()).toBe(today.getMonth());
    expect(start.getDate()).toBe(today.getDate());
  });

  it('should build check answers rows from draft', () => {
    const claim = new Claim();
    claim.breathingSpaceEnterDraft = new BreathingSpaceEnterDraft(
      BreathingSpaceType.STANDARD,
      'REF123',
      new Date(2024, 0, 15),
    );
    const rows = getBreathingSpaceCheckAnswersRows('1111', claim, 'en');
    expect(rows).toHaveLength(3);
    expect(rows[0].actions?.items[0].href).toContain(BREATHING_SPACE_ENTER_URL.replace(':id', '1111'));
    expect(rows[2].actions?.items[0].href).toContain(BREATHING_SPACE_START_DATE_URL.replace(':id', '1111'));
  });

  it('should save type and reference onto claim and keep existing start dates', async () => {
    const claim = new Claim();
    const existingStart = new Date(2024, 0, 15);
    claim.breathingSpaceEnterDraft = new BreathingSpaceEnterDraft(
      BreathingSpaceType.STANDARD,
      'OLD',
      existingStart,
    );
    (draftStoreService.generateRedisKey as jest.Mock).mockReturnValue('key');
    (draftStoreService.getCaseDataFromStore as jest.Mock).mockResolvedValue(claim);
    (draftStoreService.saveDraftClaim as jest.Mock).mockResolvedValue(undefined);

    const form = new BreathingSpaceEnterDraft(BreathingSpaceType.MENTAL_HEALTH, 'REF');
    await saveBreathingSpaceEnterDraft(
      {session: {user: {id: 'user'}}} as AppRequest,
      form,
    );

    expect(claim.breathingSpaceEnterDraft.type).toBe(BreathingSpaceType.MENTAL_HEALTH);
    expect(claim.breathingSpaceEnterDraft.reference).toBe('REF');
    expect(claim.breathingSpaceEnterDraft.start).toBe(existingStart);
    expect(draftStoreService.saveDraftClaim).toHaveBeenCalledWith('key', claim);
  });

  it('should save start date without changing expected end', async () => {
    const claim = new Claim();
    claim.breathingSpaceEnterDraft = new BreathingSpaceEnterDraft(
      BreathingSpaceType.STANDARD,
      'REF',
    );
    (draftStoreService.generateRedisKey as jest.Mock).mockReturnValue('key');
    (draftStoreService.getCaseDataFromStore as jest.Mock).mockResolvedValue(claim);
    (draftStoreService.saveDraftClaim as jest.Mock).mockResolvedValue(undefined);

    const start = new Date(2024, 0, 15);
    await saveBreathingSpaceStartDate(
      {session: {user: {id: 'user'}}} as AppRequest,
      start,
    );

    expect(claim.breathingSpaceEnterDraft.start).toBe(start);
    expect(claim.breathingSpaceEnterDraft.expectedEnd).toBeNull();
    expect(draftStoreService.saveDraftClaim).toHaveBeenCalledWith('key', claim);
  });

  it('should clear breathing space enter draft from claim', async () => {
    const claim = new Claim();
    claim.breathingSpaceEnterDraft = new BreathingSpaceEnterDraft(
      BreathingSpaceType.STANDARD,
      'REF',
    );
    (draftStoreService.generateRedisKey as jest.Mock).mockReturnValue('key');
    (draftStoreService.getCaseDataFromStore as jest.Mock).mockResolvedValue(claim);
    (draftStoreService.deleteFieldDraftClaimFromStore as jest.Mock).mockResolvedValue(undefined);

    await cancelBreathingSpaceEntry({session: {user: {id: 'user'}}} as AppRequest);

    expect(draftStoreService.deleteFieldDraftClaimFromStore).toHaveBeenCalledWith(
      'key',
      claim,
      'breathingSpaceEnterDraft',
    );
  });

  it('should return confirmation panel and next-step content by type and start date', () => {
    expect(getBreathingSpaceConfirmationPanelTitle(BreathingSpaceType.MENTAL_HEALTH))
      .toBe('PAGES.BREATHING_SPACE_ENTRY.CONFIRMATION.MENTAL_HEALTH_APPLIED');
    expect(getBreathingSpaceConfirmationNextContent(BreathingSpaceType.STANDARD, new Date()))
      .toEqual({key: 'PAGES.BREATHING_SPACE_ENTRY.CONFIRMATION.STANDARD_NEXT_NOW'});
    expect(getBreathingSpaceConfirmationNextContent(BreathingSpaceType.MENTAL_HEALTH, new Date(2024, 5, 1)).key)
      .toBe('PAGES.BREATHING_SPACE_ENTRY.CONFIRMATION.MENTAL_HEALTH_NEXT_FROM');
  });
});
