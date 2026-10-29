import {buildFreeTelephoneMediationSection} from 'services/features/claimantResponse/checkAnswers/buildFreeTelephoneMediationSection';
import {Claim} from 'models/claim';
import {ClaimantResponse} from 'models/claimantResponse';
import {Party} from 'models/party';
import {PartyType} from 'models/partyType';
import {PartyDetails} from 'form/models/partyDetails';
import {PartyPhone} from 'models/PartyPhone';
import {Mediation} from 'models/mediation/mediation';
import {CompanyTelephoneNumber} from 'form/models/mediation/companyTelephoneNumber';
import {GenericYesNo} from 'form/models/genericYesNo';
import {YesNo} from 'form/models/yesNo';

jest.mock('../../../../../../main/modules/i18n');
jest.mock('i18next', () => ({t: (key: string) => key, use: jest.fn()}));
jest.retryTimes(0);

describe('claimant mediation summary contacts', () => {
  let claim: Claim;

  beforeEach(() => {
    claim = new Claim();
    claim.id = '1234';
    claim.applicant1 = Object.assign(new Party(), {
      type: PartyType.INDIVIDUAL,
      partyDetails: Object.assign(new PartyDetails({}), {contactPerson: 'Original contact'}),
      partyPhone: new PartyPhone('07000000000'),
    });
    claim.claimantResponse = new ClaimantResponse();
    // The defendant's details must not supply the claimant's summary.
    claim.mediation = new Mediation({option: YesNo.YES, mediationPhoneNumber: '07999999999'});
  });

  const rows = (claim: Claim) => buildFreeTelephoneMediationSection(claim, claim.id, 'en').summaryList.rows;

  it('shows only the mediation choice when the claimant declines', () => {
    claim.claimantResponse.mediation = new Mediation(undefined, new GenericYesNo(YesNo.NO));

    expect(rows(claim).map(row => row.value.html)).toEqual(['COMMON.VARIATION_2.NO']);
  });

  it('uses the saved claimant phone rather than the original or defendant phone', () => {
    claim.claimantResponse.mediation = new Mediation({option: YesNo.YES, mediationPhoneNumber: '07123456789'});

    const summary = rows(claim);

    expect(summary.map(row => row.value.html)).toEqual(['COMMON.VARIATION_2.YES', '07123456789']);
    expect(summary[1].actions.items[0].href).toBe('/case/1234/mediation/can-we-use');
  });

  it.each([PartyType.COMPANY, PartyType.ORGANISATION])('uses the saved alternate contact for %s', type => {
    claim.applicant1.type = type;
    claim.claimantResponse.mediation = new Mediation(undefined, undefined, undefined,
      new CompanyTelephoneNumber(YesNo.NO, '07222222222', 'Saved contact'));

    const summary = rows(claim);

    expect(summary.map(row => row.value.html)).toEqual(['COMMON.VARIATION_2.YES', 'Saved contact', '07222222222']);
    expect(summary[1].actions.items[0].href).toBe('/case/1234/mediation/can-we-use-company');
  });

  it('retains the original business contact name and confirmed phone when selected', () => {
    claim.applicant1.type = PartyType.COMPANY;
    claim.claimantResponse.mediation = new Mediation(undefined, undefined, undefined,
      new CompanyTelephoneNumber(YesNo.YES, '07222222222', 'Unused alternate', '07333333333'));

    expect(rows(claim).map(row => row.value.html)).toEqual(['COMMON.VARIATION_2.YES', 'Original contact', '07333333333']);
  });
});
