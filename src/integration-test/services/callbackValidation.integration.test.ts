process.env.NODE_ENV = 'test';
import '../setup/testSetup';
import axios, {AxiosError, AxiosInstance} from 'axios';
import config from 'config';
import {Claim} from '../../main/common/models/claim';
import {ResponseType} from '../../main/common/form/models/responseType';
import {PaymentOptionType} from '../../main/common/form/models/admission/paymentOption/paymentOptionType';
import {CallbackValidationError} from '../../main/app/client/common/error/callbackValidationError';
import {submitResponse} from '../../main/services/features/response/submission/submitResponse';
import {civilServiceClientMock} from '../setup/sharedMocks';
import * as draftStoreService from '../../main/modules/draft-store/draftStoreService';
import {AppRequest} from '../../main/common/models/AppRequest';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const buildFullAdmitClaim = (): Claim => {
  const claim = new Claim();
  claim.id = '12345';
  claim.totalClaimAmount = 1000;
  claim.respondent1 = {
    responseType: ResponseType.FULL_ADMISSION,
    partyDetails: {
      primaryAddress: {
        postCode: 'SW1A 1AA',
        city: 'London',
        addressLine1: 'Line 1',
      },
    },
  } as never;
  claim.fullAdmission = {
    paymentIntention: {
      paymentOption: PaymentOptionType.IMMEDIATELY,
    },
  };
  return claim;
};

const appReq = {
  params: {id: '12345'},
  session: {
    user: {id: '1', accessToken: 'token'},
  },
} as AppRequest;

describe('Integration: HTTP 422 callback validation', () => {
  describe('CivilServiceClient', () => {
    it('maps civil-service HTTP 422 responses to CallbackValidationError', async () => {
      const {CivilServiceClient} = jest.requireActual<typeof import('../../main/app/client/civilServiceClient')>(
        '../../main/app/client/civilServiceClient',
      );
      const axiosError = {
        response: {
          status: 422,
          data: {
            callbackErrors: ['Business process has not finished'],
            callbackWarnings: ['Please try again later'],
          },
        },
        isAxiosError: true,
      } as AxiosError;
      const mockPost = jest.fn().mockRejectedValue(axiosError);
      mockedAxios.create.mockReturnValueOnce({post: mockPost} as unknown as AxiosInstance);

      const civilServiceClient = new CivilServiceClient(config.get<string>('services.civilService.url'));

      await expect(civilServiceClient.submitDefendantResponseEvent('12345', {}, appReq))
        .rejects
        .toMatchObject({
          name: 'CallbackValidationError',
          callbackErrors: ['Business process has not finished'],
          callbackWarnings: ['Please try again later'],
        });
    });
  });

  describe('submitResponse', () => {
    it('surfaces CallbackValidationError from civil-service HTTP 422 through submitResponse', async () => {
      const claim = buildFullAdmitClaim();
      const callbackError = new CallbackValidationError(
        ['Business process has not finished'],
        ['Please try again later'],
      );

      jest.spyOn(draftStoreService, 'generateRedisKey').mockReturnValue('redis-key');
      jest.spyOn(draftStoreService, 'getCaseDataFromStore').mockResolvedValue(claim);
      civilServiceClientMock.retrieveClaimDetails.mockResolvedValue({
        respondent1: {partyDetails: {primaryAddress: claim.respondent1?.partyDetails?.primaryAddress}},
      });
      civilServiceClientMock.submitDefendantResponseEvent.mockRejectedValue(callbackError);

      await expect(submitResponse(appReq)).rejects.toBe(callbackError);
    });
  });
});
