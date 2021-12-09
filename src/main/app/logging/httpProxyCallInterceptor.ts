export const HttpMethods = ['get', 'post', 'put', 'patch', 'delete', 'del', 'head'];

export type CallHandler = (target: object, key: string, callArgs: any[]) => void

export class HttpProxyCallInterceptor {
  static intercept(target: object, key: string, handler: CallHandler): any {
    if (HttpMethods.includes(key)) {
      const originalMethod = target[key];
      return (...args) => {
        handler(target, key, args);
        return originalMethod.apply(target, args);
      };
    } else {
      return target[key];
    }
  }
}
