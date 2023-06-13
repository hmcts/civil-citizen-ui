import { isPcqHealthy } from "client/pcq/pcqClient";
import axios, {AxiosInstance} from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('PCQ Client', () => {
  it('should check PCQ healthy', async () =>{
    //Given
    const mockGet = jest.fn().mockResolvedValue({data: {status:'UP'}});
    mockedAxios.create.mockReturnValueOnce({get: mockGet} as unknown as AxiosInstance);
    // const response = await axios.get(pcqBaseUrl + '/health');
    //When
    const health = isPcqHealthy();
    //Then
    expect(health).toBe(true);

  });
});


// import config = require('config');
// import axios from 'axios';
// import {PartyType} from 'common/models/partyType';
// import {createToken} from './generatePcqToken';

// const pcqBaseUrl: string = config.get('services.pcq.url');
// const SERVICE_ID = 'civil-citizen-ui';

// export const isPcqHealthy = async (): Promise<boolean> => {
//   try {
//     const response = await axios.get(pcqBaseUrl + '/health');
//     if (response.data.status === 'UP') {
//       return true;
//     }
//     return false;
//   } catch (error) {
//     return false;
//   }
// };

// export const isPcqElegible = (type: PartyType): boolean => {
//   if (type === PartyType.INDIVIDUAL || type === PartyType.SOLE_TRADER) {
//     return true;
//   }
//   return false;
// };

// export const generatePcqtUrl = (
//   pcqId: string,
//   actor: string,
//   ccdCaseId: string,
//   partyId: string,
//   returnUri: string,
//   lang: string,
// ): string => {
//   const pcqParameters: PcqParameters = {
//     pcqId: pcqId,
//     serviceId: SERVICE_ID,
//     actor: actor,
//     ccdCaseId: ccdCaseId,
//     partyId: partyId,
//     returnUrl: returnUri,
//     language: lang,
//   };

//   const encryptedPcqParams: EncryptedPcqParams = {
//     ...pcqParameters,
//     token: createToken(pcqParameters),
//   };

//   const qs = Object.entries(encryptedPcqParams)
//     .map(([key, value]) => key + '=' + value)
//     .join('&');
    
//   return `${pcqBaseUrl}/service-endpoint?${qs}`;
// };

// export interface PcqParameters {
//   serviceId: string;
//   actor: string;
//   pcqId: string;
//   ccdCaseId?: string;
//   partyId: string;
//   returnUrl: string;
//   language?: string;
// }

// export interface EncryptedPcqParams extends PcqParameters {
//   token: string;
// }
