import {Claim} from 'models/claim';
import {CaseRole} from 'form/models/caseRoles';
import {CaseProgressionHearing} from 'models/caseProgression/caseProgressionHearing';
import {getFinaliseTrialArrangementContents} from 'services/features/caseProgression/trialArrangements/finaliseYourTrialStartScreenContent';

jest.mock('../../../../../../main/modules/i18n');

describe('trial introduction navigation', () => {
  it.each([
    {role: CaseRole.CLAIMANT, cancelHref: '/dashboard/123/claimantNewDesign'},
    {role: CaseRole.DEFENDANT, cancelHref: '/dashboard/123/defendant'},
  ])('uses the correct dashboard for $role', ({role, cancelHref}) => {
    const claim = new Claim();
    claim.id = '123';
    claim.caseRole = role;
    claim.totalClaimAmount = 15000;
    claim.caseProgressionHearing = new CaseProgressionHearing();
    claim.caseProgressionHearing.hearingDate = new Date('2026-12-01');

    const sections = getFinaliseTrialArrangementContents(claim.id, claim, 'en');
    const start = sections.find(section => section.data?.text === 'PAGES.FINALISE_TRIAL_ARRANGEMENTS.START_NOW');

    expect(start?.data).toMatchObject({
      href: '/case/123/case-progression/finalise-trial-arrangements/is-case-ready',
      cancelHref,
    });
  });
});
