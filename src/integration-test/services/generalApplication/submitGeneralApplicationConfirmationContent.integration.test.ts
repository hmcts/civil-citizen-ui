process.env.NODE_ENV = 'test';
import '../../setup/testSetup';

jest.mock('../../../main/services/features/generalApplication/generalApplicationService', () => ({
  getCancelUrl: jest.fn(),
  isConfirmYouPaidCCJAppType: jest.fn(),
}));

import {getGeneralApplicationConfirmationContent} from '../../../main/services/features/generalApplication/submitGeneralApplicationConfirmationContent';
import {getCancelUrl, isConfirmYouPaidCCJAppType} from '../../../main/services/features/generalApplication/generalApplicationService';
import {Claim} from '../../../main/common/models/claim';

const CLAIM_ID = '1640995200000000';
const APP_ID = 'GA-1001';

describe('Integration: GA submit confirmation content builder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getCancelUrl as jest.Mock).mockResolvedValue(`/case/${CLAIM_ID}/dashboard`);
  });

  it('builds standard confirmation content with pay-fee button URL including app id and fee', async () => {
    (isConfirmYouPaidCCJAppType as jest.Mock).mockReturnValue(false);

    const sections = await getGeneralApplicationConfirmationContent(
      CLAIM_ID,
      APP_ID,
      new Claim(),
      'en',
      303,
    );

    const content = JSON.stringify(sections);
    expect(content).toContain(`/case/${CLAIM_ID}/general-application/apply-help-fee-selection?id=${APP_ID}&appFee=303`);
    expect(content).toContain('PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.WHAT_NEXT');
  });

  it('builds CoSC-specific confirmation content when confirm-paid-CCJ type is active', async () => {
    (isConfirmYouPaidCCJAppType as jest.Mock).mockReturnValue(true);

    const sections = await getGeneralApplicationConfirmationContent(
      CLAIM_ID,
      APP_ID,
      new Claim(),
      'en',
      303,
    );

    const content = JSON.stringify(sections);
    expect(content).toContain('PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.COSC_PAY_FEE');
    expect(content).toContain('PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.COSC_APPLICATION_SUBMITTED');
  });
});
