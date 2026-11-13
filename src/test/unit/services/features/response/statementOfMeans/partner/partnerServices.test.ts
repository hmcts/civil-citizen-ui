import {Claim} from 'models/claim';
import {StatementOfMeans} from 'models/statementOfMeans';
import {GenericForm} from 'form/models/genericForm';
import {GenericYesNo} from 'form/models/genericYesNo';
import {YesNo} from 'form/models/yesNo';
import {getCaseDataFromStore, saveDraftClaim} from 'modules/draft-store/draftStoreService';
import {CohabitingService} from 'services/features/response/statementOfMeans/partner/cohabitingService';
import {PartnerAgeService} from 'services/features/response/statementOfMeans/partner/partnerAgeService';
import {PartnerDisabilityService} from 'services/features/response/statementOfMeans/partner/partnerDisabilityService';
import {PartnerPensionService} from 'services/features/response/statementOfMeans/partner/partnerPensionService';
import {PartnerSevereDisabilityService} from 'services/features/response/statementOfMeans/partner/partnerSevereDisabilityService';
import {SevereDisabilityService} from 'services/features/response/statementOfMeans/severeDisabilityService';

jest.mock('modules/draft-store/draftStoreService', () => ({getCaseDataFromStore: jest.fn(), saveDraftClaim: jest.fn()}));
const read = jest.mocked(getCaseDataFromStore);
const persist = jest.mocked(saveDraftClaim);

const editors: {field: 'cohabiting' | 'partnerAge' | 'partnerDisability' | 'partnerPension' | 'partnerSevereDisability' | 'severeDisability'; get: (key: string) => Promise<GenericForm<GenericYesNo>>; save: (key: string, form: GenericForm<GenericYesNo>) => Promise<void>}[] = [
  {field: 'cohabiting', get: (key: string) => new CohabitingService().getCohabiting(key),
    save: (key: string, form: GenericForm<GenericYesNo>) => new CohabitingService().saveCohabiting(key, form)},
  {field: 'partnerAge', get: (key: string) => new PartnerAgeService().getPartnerAge(key),
    save: (key: string, form: GenericForm<GenericYesNo>) => new PartnerAgeService().savePartnerAge(key, form)},
  {field: 'partnerDisability', get: (key: string) => new PartnerDisabilityService().getPartnerDisability(key),
    save: (key: string, form: GenericForm<GenericYesNo>) => new PartnerDisabilityService().savePartnerDisability(key, form)},
  {field: 'partnerPension', get: (key: string) => new PartnerPensionService().getPartnerPension(key),
    save: (key: string, form: GenericForm<GenericYesNo>) => new PartnerPensionService().savePartnerPension(key, form)},
  {field: 'partnerSevereDisability', get: (key: string) => new PartnerSevereDisabilityService().getPartnerSevereDisability(key),
    save: (key: string, form: GenericForm<GenericYesNo>) => new PartnerSevereDisabilityService().savePartnerSevereDisability(key, form)},
  {field: 'severeDisability', get: (key: string) => new SevereDisabilityService().getSevereDisability(key),
    save: (key: string, form: GenericForm<GenericYesNo>) => new SevereDisabilityService().saveSevereDisability(key, form)},
];

describe.each(editors)('statement-of-means $field service', ({field, get, save}) => {
  let writes: {key: string; claim: Claim}[];

  beforeEach(() => {
    jest.resetAllMocks();
    writes = [];
    persist.mockImplementation(async (key, claim) => {
      writes.push({key, claim: structuredClone(claim)});
    });
  });

  it('returns an editable unanswered form when the section is absent', async () => {
    read.mockResolvedValue(new Claim());
    expect((await get('claim-owner')).model.option).toBeUndefined();
    expect(read).toHaveBeenCalledWith('claim-owner');
  });

  it.each([YesNo.YES, YesNo.NO])('round-trips saved answer %s without changing another answer', async option => {
    const claim = new Claim();
    claim.id = 'claim-owner';
    claim.totalClaimAmount = 1300;
    claim.statementOfMeans = new StatementOfMeans();
    claim.statementOfMeans.cohabiting = new GenericYesNo(YesNo.YES);
    claim.statementOfMeans.partnerAge = new GenericYesNo(YesNo.YES);
    claim.statementOfMeans[field] = new GenericYesNo(option);
    const expected = structuredClone(claim);
    read.mockResolvedValue(claim);
    expect((await get('claim-owner')).model.option).toBe(option);
    const form = new GenericForm(new GenericYesNo(option === YesNo.YES ? YesNo.NO : YesNo.YES));
    expected.statementOfMeans[field] = structuredClone(form.model);
    await save('claim-owner', form);
    expect(writes).toEqual([{key: 'claim-owner', claim: expected}]);
    expect(persist).toHaveBeenCalledTimes(1);
    expect(claim.statementOfMeans[field]).toBe(form.model);
    expect(structuredClone(claim)).toEqual(expected);
  });

  it('creates only the missing section on the same draft and key', async () => {
    const claim = new Claim();
    claim.id = 'claim-owner';
    claim.totalClaimAmount = 1300;
    const expected = structuredClone(claim);
    read.mockResolvedValue(claim);
    const form = new GenericForm(new GenericYesNo(YesNo.YES));
    expected.statementOfMeans = structuredClone(new StatementOfMeans());
    expected.statementOfMeans[field] = structuredClone(form.model);
    await save('claim-owner', form);
    expect(claim.statementOfMeans).toBeInstanceOf(StatementOfMeans);
    expect(claim.statementOfMeans[field]).toBe(form.model);
    expect(writes).toEqual([{key: 'claim-owner', claim: expected}]);
    expect(persist).toHaveBeenCalledTimes(1);
  });

  it('does not write if reading the draft fails', async () => {
    const failure = new Error('read failed');
    read.mockRejectedValue(failure);
    await expect(get('claim-owner')).rejects.toBe(failure);
    await expect(save('claim-owner', new GenericForm(new GenericYesNo(YesNo.NO)))).rejects.toBe(failure);
    expect(persist).not.toHaveBeenCalled();
  });

  it('propagates an actual write failure after successfully reading the draft', async () => {
    read.mockResolvedValue(new Claim());
    const failure = new Error('write failed');
    persist.mockRejectedValue(failure);
    await expect(save('claim-owner', new GenericForm(new GenericYesNo(YesNo.YES)))).rejects.toBe(failure);
    expect(persist).toHaveBeenCalledTimes(1);
  });
});
