import * as LaunchDarkly from 'launchdarkly-node-server-sdk';
import {getFlagValue} from '../../../../../main/app/auth/launchdarkly/launchDarklyClient';

jest.mock('launchdarkly-node-server-sdk');
//   ,() => {
//   return jest.fn().mockImplementation(() => {
//     return { LDClient: jest.fn(async () => {
//       return (
//         {
//           waitForInitialization: jest.fn(async () => {
//             return;
//           }),
//           variation: jest.fn(async () => {
//             return;
//           }),
//         }
//       );
//     }),
//     };
//   });
// });

const mockedLaunchDarkly = LaunchDarkly as jest.Mocked<typeof LaunchDarkly>;
//const mockedLaunchDarklyClient = LDClient as jest.Mocked<typeof LDClient>;

describe('Launch Darkly Client', () => {

  function waitForInitialization(): Promise<LaunchDarkly.LDClient> {
    return Promise.resolve({} as LaunchDarkly.LDClient);
  }

  function variation(): Promise<LaunchDarkly.LDFlagValue> {
    return Promise.resolve({} as LaunchDarkly.LDFlagValue);
  }

  const mockClient: Partial<LaunchDarkly.LDClient> = {
    waitForInitialization: waitForInitialization,
    variation: variation,
  } as Partial<LaunchDarkly.LDClient>;

  // jest.mock('LaunchDarkly', () => {
  //   return jest.fn().mockImplementation(() => {
  //     return {
  //       waitForInitialization: jest.fn(async () => {
  //         return;
  //       }),
  //       variation: jest.fn(async () => {
  //         return;
  //       }),
  //     };
  //   });
  // });

  //const mockedLaunchDarklyClient = mockClient as jest.Mocked<typeof mockClient>;

  const user = {
    'name': 'civil-service',
    'key': 'civil-service',
  };

  //
  // jest.mock('launchdarkly-node-server-sdk', () => {
  //   return {
  //     LaunchDarkly: jest.fn().mockImplementation(() => {
  //       return {
  //         init: mockClient,
  //       };
  //     }),
  //   };
  // });

  it('mock launch darkly', async () => {
    //const spyMock = jest.spyOn(mockClient, 'variation');
    //initMock.mockImplementation(() => mockClient);

    // LaunchDarkly.init() = jest.fn().mockImplementation(() => {
    //   return mockClient;
    // });

    // const initMock = jest.fn().mockImplementation(() => {
    //   return mockClient;
    // });

    getFlagValue('test-key');

    //expect(initMock).toHaveBeenCalled();
    //expect(mockedLaunchDarklyClient.variation('test-key', user, false)).toHaveBeenCalled();
    expect(mockedLaunchDarkly.init).toHaveBeenCalledWith('sdk-5dca6386-1fcd-48d5-b93a-60d13e22ee62');
    expect(mockClient.variation('test-key', user, false)).toHaveBeenCalled();
  });

});
