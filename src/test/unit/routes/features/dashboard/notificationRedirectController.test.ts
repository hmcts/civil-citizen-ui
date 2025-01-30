import nock from 'nock';
import request from 'supertest';
import {app} from '../../../../../main/app';
import config from 'config';
import * as DraftStoreService from 'modules/draft-store/draftStoreService';
import * as ApplyHelpFeeSelectionService from 'services/features/caseProgression/hearingFee/applyHelpFeeSelectionService';
import {Claim} from 'models/claim';
import {SystemGeneratedCaseDocuments} from 'models/document/systemGeneratedCaseDocuments';
import {DocumentType} from 'models/document/documentType';
import {DASHBOARD_NOTIFICATION_REDIRECT, DASHBOARD_NOTIFICATION_REDIRECT_DOCUMENT} from 'routes/urls';
import {CIVIL_SERVICE_RECORD_NOTIFICATION_CLICK_URL} from 'client/civilServiceUrls';
import {civilClaimResponseMock} from '../../../../utils/mockDraftStore';
import {CivilServiceClient} from 'client/civilServiceClient';
import * as StringUtils from 'common/utils/stringUtils';
import {getCaseProgressionHearingMock} from '../../../../utils/caseProgression/mockCaseProgressionHearing';
import {ClaimBilingualLanguagePreference} from 'models/claimBilingualLanguagePreference';
import {CaseRole} from 'form/models/caseRoles';
import {CCDRespondentLiPResponse, CCDRespondentResponseLanguage} from 'models/ccdResponse/ccdRespondentLiPResponse';
import {checkWelshHearingNotice} from 'services/features/caseProgression/hearing/hearingService';
import {CaseProgressionHearingDocuments} from 'models/caseProgression/caseProgressionHearing';

jest.mock('../../../../../main/modules/oidc');
jest.mock('../../../../../main/modules/draft-store');

describe('Notification Redirect Controller - Get', () => {
  const citizenRoleToken: string = config.get('citizenRoleToken');
  const idamUrl: string = config.get('idamUrl');
  const civilServiceUrl = config.get<string>('services.civilService.url');

  beforeAll(() => {
    nock(idamUrl)
      .post('/o/token')
      .reply(200, {id_token: citizenRoleToken});
  });

  it('Redirect to view document page', async () => {
    //given
    const claim: Claim = new Claim();
    claim.id = '123';
    claim.systemGeneratedCaseDocuments = [
      {
        id: '789',
        value: {
          documentLink: {
            document_url: 'url',
            document_filename: 'name',
            document_binary_url: '/456/binary',
          },
          documentType: DocumentType.SEALED_CLAIM,
        },
      },
    ] as SystemGeneratedCaseDocuments[];

    nock(civilServiceUrl)
      .put(CIVIL_SERVICE_RECORD_NOTIFICATION_CLICK_URL.replace(':notificationId', '321'))
      .reply(200, {});

    const data = Object.assign(claim, civilClaimResponseMock.case_data);
    jest
      .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
      .mockResolvedValueOnce(data);

    //when
    await request(app)
      .get(DASHBOARD_NOTIFICATION_REDIRECT
        .replace(':id', '123')
        .replace(':locationName', 'VIEW_ORDERS_AND_NOTICES')
        .replace(':notificationId', '321'))
      //then
      .expect((res: Response) => {
        expect(res.status).toBe(302);
        expect(res.text).toBe('Found. Redirecting to /case/123/view-orders-and-notices');
      });

  });

  it('Redirect to gov payment page', async () => {
    //given
    const claim: Claim = new Claim();
    claim.id = '123';

    nock(civilServiceUrl)
      .put(CIVIL_SERVICE_RECORD_NOTIFICATION_CLICK_URL.replace(':notificationId', '321'))
      .reply(200, {});

    jest.spyOn(DraftStoreService, 'saveDraftClaim').mockReturnValueOnce(Promise.resolve());
    const data = Object.assign(claim, civilClaimResponseMock.case_data);
    jest
      .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
      .mockResolvedValueOnce(data);
    jest.spyOn(ApplyHelpFeeSelectionService, 'getRedirectUrl').mockReturnValueOnce(Promise.resolve('https://card.payments.service.gov.uk/secure/7b0716b2-40c4-413e-b62e-72c599c91960'));

    //when
    await request(app)
      .get(DASHBOARD_NOTIFICATION_REDIRECT
        .replace(':id', '123')
        .replace(':locationName', 'PAY_HEARING_FEE_URL')
        .replace(':notificationId', '321'))
      //then
      .expect((res: Response) => {
        expect(res.status).toBe(302);
        expect(res.text).toBe('Found. Redirecting to https://card.payments.service.gov.uk/secure/7b0716b2-40c4-413e-b62e-72c599c91960');
      });
  });

  it('Redirect to view document page with document Id', async () => {
    //given
    const claim: Claim = new Claim();
    claim.id = '123';
    claim.systemGeneratedCaseDocuments = [
      {
        id: '789',
        value: {
          documentLink: {
            document_url: 'url',
            document_filename: 'name',
            document_binary_url: '/456/binary',
          },
          documentType: DocumentType.SEALED_CLAIM,
        },
      },
    ] as SystemGeneratedCaseDocuments[];

    nock(civilServiceUrl)
      .put(CIVIL_SERVICE_RECORD_NOTIFICATION_CLICK_URL.replace(':notificationId', '321'))
      .reply(200, {});

    const data = Object.assign(claim, civilClaimResponseMock.case_data);
    jest
      .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
      .mockResolvedValueOnce(data);

    //when
    await request(app)
      .get(DASHBOARD_NOTIFICATION_REDIRECT_DOCUMENT
        .replace(':id', '123')
        .replace(':locationName', 'VIEW_ORDERS_AND_NOTICES')
        .replace(':notificationId', '321')
        .replace(':documentId', '1234'))
      //then
      .expect((res: Response) => {
        expect(res.status).toBe(302);
        expect(res.text).toBe('Found. Redirecting to /case/123/view-orders-and-notices');
      });
  });

  it('Redirect to view document order with document Id', async () => {
    //given
    const claim: Claim = new Claim();
    claim.id = '123';
    claim.systemGeneratedCaseDocuments = [
      {
        id: '789',
        value: {
          documentLink: {
            document_url: 'url',
            document_filename: 'name',
            document_binary_url: '/456/binary',
          },
          documentType: DocumentType.SEALED_CLAIM,
        },
      },
    ] as SystemGeneratedCaseDocuments[];

    nock(civilServiceUrl)
      .put(CIVIL_SERVICE_RECORD_NOTIFICATION_CLICK_URL.replace(':notificationId', '321'))
      .reply(200, {});

    const data = Object.assign(claim, civilClaimResponseMock.case_data);
    jest
      .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
      .mockResolvedValueOnce(data);

    //when
    await request(app)
      .get(DASHBOARD_NOTIFICATION_REDIRECT_DOCUMENT
        .replace(':id', '123')
        .replace(':locationName', 'VIEW_FINAL_ORDER')
        .replace(':notificationId', '321')
        .replace(':documentId', '1234'))
      //then
      .expect((res: Response) => {
        expect(res.status).toBe(302);
        expect(res.text).toBe('Found. Redirecting to /case/1645882162449409/view-documents/1234');
      });
  });

  it('Redirect to view hearing notice with document Id', async () => {
    //given
    const claim: Claim = new Claim();
    claim.id = '123';

    nock(civilServiceUrl)
      .put(CIVIL_SERVICE_RECORD_NOTIFICATION_CLICK_URL.replace(':notificationId', '321'))
      .reply(200, {});

    const data = Object.assign(claim, civilClaimResponseMock.case_data);
    jest
      .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
      .mockResolvedValueOnce(data);

    const checkDocumentId = jest
      .spyOn(StringUtils, 'documentIdExtractor');

    //when
    await request(app)
      .get(DASHBOARD_NOTIFICATION_REDIRECT
        .replace(':id', '123')
        .replace(':locationName', 'VIEW_HEARING_NOTICE')
        .replace(':notificationId', '321'))
      //then
      .expect((res: Response) => {
        expect(res.status).toBe(302);
        expect(res.text).toBe('Found. Redirecting to /case/123/view-documents/456');
      });
    expect(checkDocumentId).toHaveBeenCalledTimes(1);
  });

  it('Redirect to view hearing notice without document Id - when no case progression hearing', async () => {
    //given
    const claim: Claim = new Claim();
    claim.id = '123';

    nock(civilServiceUrl)
      .put(CIVIL_SERVICE_RECORD_NOTIFICATION_CLICK_URL.replace(':notificationId', '321'))
      .reply(200, {});

    jest
      .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
      .mockResolvedValueOnce(claim);

    const checkDocumentId = jest
      .spyOn(StringUtils, 'documentIdExtractor');

    //when
    await request(app)
      .get(DASHBOARD_NOTIFICATION_REDIRECT
        .replace(':id', '123')
        .replace(':locationName', 'VIEW_HEARING_NOTICE')
        .replace(':notificationId', '321'))
      //then
      .expect((res: Response) => {
        expect(res.status).toBe(302);
        expect(res.text).toBe('Found. Redirecting to /case/123/view-documents/undefined');
      });
    expect(checkDocumentId).toHaveBeenCalledTimes(2);
  });

  it('Throw error - when no hearing documents', async () => {
    //given
    const claim: Claim = new Claim();
    claim.id = '123';

    nock(civilServiceUrl)
      .put(CIVIL_SERVICE_RECORD_NOTIFICATION_CLICK_URL.replace(':notificationId', '321'))
      .reply(200, {});

    claim.caseProgressionHearing = getCaseProgressionHearingMock();
    claim.caseProgressionHearing.hearingDocuments = null;

    jest
      .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
      .mockResolvedValueOnce(claim);

    //when
    await request(app)
      .get(DASHBOARD_NOTIFICATION_REDIRECT
        .replace(':id', '123')
        .replace(':locationName', 'VIEW_HEARING_NOTICE')
        .replace(':notificationId', '321'))
      //then
      .expect((res: Response) => {
        expect(res.status).toBe(500);
      });
  });

  it('Redirect to view hearing notice without document Id - when no value', async () => {
    //given
    const claim: Claim = new Claim();
    claim.id = '123';

    nock(civilServiceUrl)
      .put(CIVIL_SERVICE_RECORD_NOTIFICATION_CLICK_URL.replace(':notificationId', '321'))
      .reply(200, {});

    claim.caseProgressionHearing = getCaseProgressionHearingMock();
    claim.caseProgressionHearing.hearingDocuments[0].value = null;

    jest
      .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
      .mockResolvedValueOnce(claim);

    //when
    await request(app)
      .get(DASHBOARD_NOTIFICATION_REDIRECT
        .replace(':id', '123')
        .replace(':locationName', 'VIEW_HEARING_NOTICE')
        .replace(':notificationId', '321'))
      //then
      .expect((res: Response) => {
        expect(res.status).toBe(302);
        expect(res.text).toBe('Found. Redirecting to /case/123/view-documents/undefined');
      });
  });

  it('Redirect to view hearing notice without document Id - when no document link', async () => {
    //given
    const claim: Claim = new Claim();
    claim.id = '123';

    nock(civilServiceUrl)
      .put(CIVIL_SERVICE_RECORD_NOTIFICATION_CLICK_URL.replace(':notificationId', '321'))
      .reply(200, {});

    claim.caseProgressionHearing = getCaseProgressionHearingMock();
    claim.caseProgressionHearing.hearingDocuments[0].value.documentLink = null;

    jest
      .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
      .mockResolvedValueOnce(claim);

    //when
    await request(app)
      .get(DASHBOARD_NOTIFICATION_REDIRECT
        .replace(':id', '123')
        .replace(':locationName', 'VIEW_HEARING_NOTICE')
        .replace(':notificationId', '321'))
      //then
      .expect((res: Response) => {
        expect(res.status).toBe(302);
        expect(res.text).toBe('Found. Redirecting to /case/123/view-documents/undefined');
      });
  });

  it('Redirect to view hearing notice without document Id - when no binary url', async () => {
    //given
    const claim: Claim = new Claim();
    claim.id = '123';

    nock(civilServiceUrl)
      .put(CIVIL_SERVICE_RECORD_NOTIFICATION_CLICK_URL.replace(':notificationId', '321'))
      .reply(200, {});

    claim.caseProgressionHearing = getCaseProgressionHearingMock();
    claim.caseProgressionHearing.hearingDocuments[0].value.documentLink.document_binary_url = undefined;

    jest
      .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
      .mockResolvedValueOnce(claim);

    //when
    await request(app)
      .get(DASHBOARD_NOTIFICATION_REDIRECT
        .replace(':id', '123')
        .replace(':locationName', 'VIEW_HEARING_NOTICE')
        .replace(':notificationId', '321'))
      //then
      .expect((res: Response) => {
        expect(res.status).toBe(302);
        expect(res.text).toBe('Found. Redirecting to /case/123/view-documents/undefined');
      });
  });

  it('Redirect to view welsh hearing notice claimant', async () => {
    //given
    const claim: Claim = new Claim();
    claim.id = '123';

    nock(civilServiceUrl)
      .put(CIVIL_SERVICE_RECORD_NOTIFICATION_CLICK_URL.replace(':notificationId', '321'))
      .reply(200, {});

    claim.caseProgressionHearing = getCaseProgressionHearingMock();
    claim.caseProgressionHearing.hearingDocumentsWelsh = claim.caseProgressionHearing.hearingDocuments;
    claim.claimantBilingualLanguagePreference = ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH;
    claim.caseRole = CaseRole.CLAIMANT;
    jest
      .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
      .mockResolvedValueOnce(claim);

    //when
    await request(app)
      .get(DASHBOARD_NOTIFICATION_REDIRECT
        .replace(':id', '123')
        .replace(':locationName', 'VIEW_HEARING_NOTICE')
        .replace(':notificationId', '321'))
      //then
      .expect((res: Response) => {
        expect(res.status).toBe(302);
        expect(res.text).toBe('Found. Redirecting to /case/123/view-documents/e9fd1e10-baf2-4d95-bc79-bdeb9f3a2ab6');
      });
  });

  it('Redirect to view welsh hearing notice defendant', async () => {
    //given
    const claim: Claim = new Claim();
    claim.id = '123';

    nock(civilServiceUrl)
      .put(CIVIL_SERVICE_RECORD_NOTIFICATION_CLICK_URL.replace(':notificationId', '321'))
      .reply(200, {});

    const ccdRespondLipResponse : CCDRespondentLiPResponse = {
      respondent1MediationLiPResponse: undefined,
      respondent1ResponseLanguage: CCDRespondentResponseLanguage.BOTH,
    };

    claim.caseProgressionHearing = getCaseProgressionHearingMock();
    claim.caseProgressionHearing.hearingDocumentsWelsh = claim.caseProgressionHearing.hearingDocuments;
    claim.caseRole = CaseRole.DEFENDANT;
    claim.respondent1LiPResponse = ccdRespondLipResponse;

    jest
      .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
      .mockResolvedValueOnce(claim);

    //when
    await request(app)
      .get(DASHBOARD_NOTIFICATION_REDIRECT
        .replace(':id', '123')
        .replace(':locationName', 'VIEW_HEARING_NOTICE')
        .replace(':notificationId', '321'))
      //then
      .expect((res: Response) => {
        expect(res.status).toBe(302);
        expect(res.text).toBe('Found. Redirecting to /case/123/view-documents/e9fd1e10-baf2-4d95-bc79-bdeb9f3a2ab6');
      });
  });

  it('Redirect to english hearing notice if hearingDocumentsWelsh exists but user prefers only english (claimant)', async () => {
    //given
    const claim: Claim = new Claim();
    claim.id = '123';

    nock(civilServiceUrl)
      .put(CIVIL_SERVICE_RECORD_NOTIFICATION_CLICK_URL.replace(':notificationId', '321'))
      .reply(200, {});

    claim.caseProgressionHearing = getCaseProgressionHearingMock();
    claim.caseProgressionHearing.hearingDocumentsWelsh = claim.caseProgressionHearing.hearingDocuments;

    claim.caseRole = CaseRole.CLAIMANT;
    claim.claimantBilingualLanguagePreference = ClaimBilingualLanguagePreference.ENGLISH;

    jest
      .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
      .mockResolvedValueOnce(claim);

    //when
    await request(app)
      .get(DASHBOARD_NOTIFICATION_REDIRECT
        .replace(':id', '123')
        .replace(':locationName', 'VIEW_HEARING_NOTICE')
        .replace(':notificationId', '321'))
      //then
      .expect((res: Response) => {
        expect(res.status).toBe(302);
        expect(res.text).toBe('Found. Redirecting to /case/123/view-documents/e9fd1e10-baf2-4d95-bc79-bdeb9f3a2ab6');
      });
  });

  it('Redirect to english hearing notice if hearingDocumentsWelsh[0] is missing/invalid, even when user has welsh preference', async () => {
    //given
    const claim: Claim = new Claim();
    claim.id = '123';

    nock(civilServiceUrl)
      .put(CIVIL_SERVICE_RECORD_NOTIFICATION_CLICK_URL.replace(':notificationId', '321'))
      .reply(200, {});

    claim.caseProgressionHearing = getCaseProgressionHearingMock();
    claim.caseProgressionHearing.hearingDocumentsWelsh = [];

    claim.caseRole = CaseRole.CLAIMANT;
    claim.claimantBilingualLanguagePreference = ClaimBilingualLanguagePreference.WELSH_AND_ENGLISH;

    jest
      .spyOn(CivilServiceClient.prototype, 'retrieveClaimDetails')
      .mockResolvedValueOnce(claim);

    //when
    await request(app)
      .get(DASHBOARD_NOTIFICATION_REDIRECT
        .replace(':id', '123')
        .replace(':locationName', 'VIEW_HEARING_NOTICE')
        .replace(':notificationId', '321'))
      //then
      .expect((res: Response) => {
        expect(res.status).toBe(302);
        expect(res.text).toBe('Found. Redirecting to /case/123/view-documents/e9fd1e10-baf2-4d95-bc79-bdeb9f3a2ab6');
      });
  });
});

jest.mock('client/civilServiceClient');
jest.mock('services/features/caseProgression/hearing/hearingService', () => {
  const originalModule = jest.requireActual('services/features/caseProgression/hearing/hearingService');
  return {
    ...originalModule,
    checkWelshHearingNotice: jest.fn(),
  };
});

describe('notificationRedirectController - VIEW_HEARING_NOTICE (Welsh block)', () => {
  const mockCivilServiceClient = new CivilServiceClient(config.get('services.civilService.url'));
  const baseUrl = DASHBOARD_NOTIFICATION_REDIRECT
    .replace(':id', '123')
    .replace(':notificationId', '456')
    .replace(':locationName', 'VIEW_HEARING_NOTICE');

  let claim: Claim;

  beforeEach(() => {
    claim = new Claim();
    claim.id = '123';
    claim.caseProgressionHearing = {
      hearingFeePaymentDetails: undefined, getDurationOfDaysForHearing(): number {
        return 0;
      }, getHearingDateFormatted(lang: string): string {
        return '';
      }, getHearingDurationFormatted(lng: string): string {
        return '';
      }, getHearingTimeHourMinuteFormatted(): string {
        return '';
      }, hearingDocuments: [], hearingDocumentsWelsh: [] };
    mockCivilServiceClient.retrieveClaimDetails = jest.fn().mockResolvedValue(claim);
    CivilServiceClient.prototype.recordClick = jest.fn().mockResolvedValue({});
    CivilServiceClient.prototype.retrieveClaimDetails = mockCivilServiceClient.retrieveClaimDetails;
    (checkWelshHearingNotice as jest.Mock).mockReturnValue(false);
  });

  it('should not redirect to Welsh doc if hearingDocumentsWelsh is empty', async () => {
    claim.caseProgressionHearing.hearingDocumentsWelsh = [];
    (checkWelshHearingNotice as jest.Mock).mockReturnValue(true);
    const res = await request(app).get(`${baseUrl}?lang=cy`).send();
    expect(res.status).toBe(302);
    expect(res.text).toContain('/case/123/view-documents/undefined');
  });

  it('should not redirect to Welsh doc if first item is missing', async () => {
    claim.caseProgressionHearing.hearingDocumentsWelsh = null;
    (checkWelshHearingNotice as jest.Mock).mockReturnValue(true);
    const res = await request(app).get(`${baseUrl}?lang=cy`).send();
    expect(res.status).toBe(302);
    expect(res.text).toContain('/case/123/view-documents/undefined');
  });

  it('should not redirect to Welsh doc if lang != cy', async () => {
    claim.caseProgressionHearing.hearingDocumentsWelsh = [
      { id: 'wDoc', value: { documentLink: { document_binary_url: 'http://doc/binary' } } } as CaseProgressionHearingDocuments,
    ];
    (checkWelshHearingNotice as jest.Mock).mockReturnValue(true);
    const res = await request(app).get(baseUrl).send();
    expect(res.status).toBe(302);
    expect(res.text).toContain('/case/123/view-documents/undefined');
  });

  it('should not redirect to Welsh doc if checkWelshHearingNotice is false', async () => {
    claim.caseProgressionHearing.hearingDocumentsWelsh = [
      { id: 'wDoc', value: { documentLink: { document_binary_url: 'http://dm-store/binary' } } } as CaseProgressionHearingDocuments,
    ];
    (checkWelshHearingNotice as jest.Mock).mockReturnValue(false);
    const res = await request(app).get(`${baseUrl}?lang=cy`).send();
    expect(res.status).toBe(302);
    expect(res.text).toContain('/case/123/view-documents/undefined');
  });

  it('should redirect to Welsh doc if doc exists, lang=cy and checkWelshHearingNotice is true', async () => {
    claim.caseProgressionHearing.hearingDocumentsWelsh = [
      { id: 'wDoc', value: { documentLink: { document_binary_url: 'http://dm-store/binary' } } } as CaseProgressionHearingDocuments,
    ];
    (checkWelshHearingNotice as jest.Mock).mockReturnValue(true);
    const res = await request(app).get(`${baseUrl}?lang=cy`).send();
    expect(res.status).toBe(302);
    expect(res.text).toContain(`Found. Redirecting to /case/123/view-documents/undefined`);
  });
});
