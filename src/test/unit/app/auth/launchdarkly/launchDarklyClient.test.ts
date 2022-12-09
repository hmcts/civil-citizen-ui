import * as LaunchDarkly from 'launchdarkly-node-server-sdk';
import {getFlagValue} from '../../../../../main/app/auth/launchdarkly/launchDarklyClient';

jest.mock('launchdarkly-node-server-sdk');
const mockedLaunchDarkly = LaunchDarkly as jest.Mocked<typeof LaunchDarkly>;

describe('Launch Darkly Client', () => {

  it('mock launch darkly', async () => {

    getFlagValue('test-key');

    expect(mockedLaunchDarkly.init).toHaveBeenCalledWith('sdk-5dca6386-1fcd-48d5-b93a-60d13e22ee62');
  });

});
