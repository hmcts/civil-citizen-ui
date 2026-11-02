import express, {Express} from 'express';
import cookieParser from 'cookie-parser';
import config from 'config';
import {Helmet} from '../../../main/modules/helmet';

type StackLayer = {
  handle: (req: unknown, res: unknown, next: (err?: unknown) => void) => void;
};

const routerStack = (application: Express): StackLayer[] =>
  (application as unknown as {router: {stack: StackLayer[]}}).router.stack;

const createHeaderResponse = () => {
  const headers: Record<string, string | string[]> = {};
  return {
    locals: {} as Record<string, unknown>,
    statusCode: 0,
    headersSent: false,
    setHeader(name: string, value: string | string[]) {
      headers[name.toLowerCase()] = value;
    },
    getHeader(name: string) {
      return headers[name.toLowerCase()];
    },
    removeHeader(name: string) {
      delete headers[name.toLowerCase()];
    },
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    end: jest.fn(),
    send(body?: unknown) {
      this.statusCode = 200;
      this.end(body);
    },
    headers,
  };
};

const invoke = (application: Express) => {
  const req = {
    method: 'HEAD',
    url: '/',
    originalUrl: '/',
    path: '/',
    headers: {},
    cookies: {} as Record<string, string | undefined>,
  };
  const res = createHeaderResponse();
  const run = (index: number, stack: StackLayer[]): void => {
    if (index >= stack.length) {
      return;
    }
    stack[index].handle(req, res, (err?: unknown) => {
      if (err) {
        throw err;
      }
      run(index + 1, stack);
    });
  };
  run(0, routerStack(application));
  return res;
};

describe('HTTP security headers', () => {
  const app = express();
  app.use(cookieParser());
  new Helmet(config.get('security')).enableFor(app);
  app.get('/', (_req, res) => res.send('OK'));

  it('blocks embedded objects and sends one year of HSTS without preload', () => {
    const response = invoke(app);

    expect(response.statusCode).toBe(200);
    const policy = response.headers['content-security-policy'];
    expect(String(policy).split(';')).toContain("object-src 'none'");
    expect(response.headers['strict-transport-security']).toBe('max-age=31536000; includeSubDomains');
  });
});
