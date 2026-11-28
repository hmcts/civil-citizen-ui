import {AsyncLocalStorage} from 'async_hooks';
import {AppRequest} from 'common/models/AppRequest';

const requestStorage = new AsyncLocalStorage<AppRequest>();

export const bindRequestContext = (req: AppRequest, next: () => void): void => {
  requestStorage.run(req, next);
};

export const currentAppRequest = (): AppRequest | undefined => requestStorage.getStore();
