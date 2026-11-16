import {Claim} from 'models/claim';
import {getCancelUrl} from 'services/features/generalApplication/generalApplicationService';
import {getCoScGeneralApplicationConfirmationContent} from 'services/features/generalApplication/submitGeneralApplicationConfirmationContent';

jest.mock('services/features/generalApplication/generalApplicationService', () => ({
  getCancelUrl: jest.fn(),
  isConfirmYouPaidCCJAppType: jest.fn(),
}));

describe('Certificate of satisfaction confirmation content', () => {
  it('should include the pay-fee section for a certificate of satisfaction', async () => {
    const claim = new Claim();
    (getCancelUrl as jest.Mock).mockResolvedValue('/dashboard');

    const content = await getCoScGeneralApplicationConfirmationContent('12345', 'app-1', claim, 'en', 100);

    expect(getCancelUrl).toHaveBeenCalledWith('12345', claim);
    expect(JSON.stringify(content)).toContain('PAGES.GENERAL_APPLICATION.CONFIRMATION_PAGE.COSC_PAY_FEE');
  });
});
