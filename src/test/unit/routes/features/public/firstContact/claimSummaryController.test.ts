import request from 'supertest';
import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import firstContactClaimSummaryController from '../../../../../../main/routes/features/public/firstContact/claimSummaryController';
import { getFirstContactData } from 'services/firstcontact/firstcontactService';
import { getClaimById } from 'modules/utilityService';
import { getInterestDetails } from 'common/utils/interestUtils';
import { getFixedCost, getTotalAmountWithInterestAndFeesAndFixedCost } from 'modules/claimDetailsService';
import { getClaimTimeline } from 'services/features/common/claimTimelineService';
import { YesNo } from 'form/models/yesNo';
import crypto from 'crypto';

// Mock dependencies
jest.mock('services/firstcontact/firstcontactService');
jest.mock('modules/utilityService');
jest.mock('common/utils/interestUtils');
jest.mock('modules/claimDetailsService');
jest.mock('services/features/common/claimTimelineService');

// Helper helper function to encrypt mock tokens for the test cases
function encryptAES(text: string, secretKey: string): string {
  const key = crypto.createHash('sha256').update(secretKey).digest();
  const iv = Buffer.alloc(16, 0);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return encrypted;
}

describe('First Contact Claim Summary Controller', () => {
  let app: express.Express;

  beforeEach(() => {
    jest.clearAllMocks();

    app = express();
    app.use(express.json());
    app.use(cookieParser());
    app.use(session({
      secret: 'test-secret',
      resave: false,
      saveUninitialized: true,
    }));

    // Mock Express views rendering pipeline
    app.set('view engine', 'njk');
    app.engine('njk', (filePath: string, options: any, callback: any) => {
      callback(null, 'rendered_view_content');
    });

    app.use('/', firstContactClaimSummaryController);
  });

  it('should redirect to access denied if claimId is missing in session data', async () => {
    (getFirstContactData as jest.Mock).mockReturnValue({});

    const response = await request(app).get('/first-contact/claim-summary');

    expect(response.status).toBe(302);
    expect(response.header.location).toContain('access-denied');
  });

  it('should redirect to access denied if pin or accessCode is missing', async () => {
    (getFirstContactData as jest.Mock).mockReturnValue({ claimId: '123' });
    (getClaimById as jest.Mock).mockResolvedValue({
      respondent1PinToPostLRspec: {}, // Missing accessCode
    });

    const response = await request(app).get('/first-contact/claim-summary');

    expect(response.status).toBe(302);
    expect(response.header.location).toContain('access-denied');
  });

  it('should redirect to access denied if decrypted text does not match YesNo.YES', async () => {
    const accessCode = 'MY_SECRET_ACCESS_CODE';
    const wrongEncryptedPin = encryptAES('NO', accessCode);

    (getFirstContactData as jest.Mock).mockReturnValue({ claimId: '123', pin: wrongEncryptedPin });
    (getClaimById as jest.Mock).mockResolvedValue({
      respondent1PinToPostLRspec: { accessCode },
    });

    const response = await request(app).get('/first-contact/claim-summary');

    expect(response.status).toBe(302);
    expect(response.header.location).toContain('access-denied');
  });

  it('should render view successfully with details if PIN decrypts successfully to YES', async () => {
    const accessCode = 'VALID_ACCESS_CODE';
    const validEncryptedPin = encryptAES(YesNo.YES, accessCode);
    const mockClaim = {
      id: '123',
      respondent1PinToPostLRspec: { accessCode },
      extractDocumentId: jest.fn().mockReturnValue('doc-999'),
    };

    (getFirstContactData as jest.Mock).mockReturnValue({ claimId: '123', pin: validEncryptedPin });
    (getClaimById as jest.Mock).mockResolvedValue(mockClaim);
    (getInterestDetails as jest.Mock).mockResolvedValue({ interest: 10 });
    (getTotalAmountWithInterestAndFeesAndFixedCost as jest.Mock).mockResolvedValue(500);
    (getClaimTimeline as jest.Mock).mockReturnValue([{ date: '2023-01-01', description: 'Event' }]);
    (getFixedCost as jest.Mock).mockResolvedValue(25);

    const response = await request(app)
      .get('/first-contact/claim-summary')
      .query({ lang: 'en' });

    expect(response.status).toBe(200);
    expect(getInterestDetails).toHaveBeenCalledWith(mockClaim);
    expect(getTotalAmountWithInterestAndFeesAndFixedCost).toHaveBeenCalledWith(mockClaim);
    expect(getClaimTimeline).toHaveBeenCalled();
    expect(getFixedCost).toHaveBeenCalledWith(mockClaim);
  });

  it('should pass down errors to next middleware if a backend helper promise fails', async () => {
    (getFirstContactData as jest.Mock).mockReturnValue({ claimId: '123' });
    (getClaimById as jest.Mock).mockRejectedValue(new Error('Database Connection Failed'));

    // Temporary custom error handler to trap the next(error) bubble
    app.use((err: any, req: any, res: any, next: any) => {
      res.status(500).json({ error: err.message });
    });

    const response = await request(app).get('/first-contact/claim-summary');

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Database Connection Failed');
  });
});
