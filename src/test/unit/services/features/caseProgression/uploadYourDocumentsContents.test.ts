import {Claim} from 'models/claim';
import {CaseRole} from 'form/models/caseRoles';
import {getUploadYourDocumentsContents} from 'services/features/caseProgression/uploadYourDocumentsContents';

jest.mock('../../../../../main/modules/i18n');
jest.retryTimes(0);

describe('upload introduction destinations', () => {
  describe.each([
    {role: CaseRole.CLAIMANT, cancelUrl: '/dashboard/123/claimantNewDesign'},
    {role: CaseRole.DEFENDANT, cancelUrl: '/dashboard/123/defendant'},
  ])('$role', ({role, cancelUrl}) => {
    it.each([
      {enabled: true, applicationUrl: '/case/123/general-application/application-type'},
      {enabled: false, applicationUrl: 'https://www.gov.uk/government/publications/form-n244-application-notice'},
    ])('preserves navigation when GA NRO is $enabled', ({enabled, applicationUrl}) => {
      const claim = new Claim();
      claim.id = '123';
      claim.caseRole = role;
      claim.totalClaimAmount = 1000;

      const sections = getUploadYourDocumentsContents(claim.id, claim, enabled);
      const applicationLink = sections.find(section => section.data?.text === 'PAGES.UPLOAD_YOUR_DOCUMENTS.APPLY_TO_THE_COURT');
      const startButton = sections.find(section => section.data?.text === 'PAGES.UPLOAD_YOUR_DOCUMENTS.START_NOW');

      expect(applicationLink?.data.href).toBe(applicationUrl);
      expect(startButton?.data).toMatchObject({
        href: '/case/123/case-progression/type-of-documents',
        cancelHref: cancelUrl,
      });
    });
  });
});
