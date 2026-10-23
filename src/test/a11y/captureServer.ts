import express from 'express';
import {Server, createServer, get} from 'http';
import path from 'path';
import {readFile} from 'fs/promises';
import {translateUrlToFilePath} from '../utils/mocks/a11y/urlToFileName';

export function captureUrl(url: string): string {
  return url.replace(':id', '1645882162449409')
    .replace(':appId', '1720536653906339')
    .replace(':qmType', 'SEND_DOCUMENTS')
    .replace(':qmQualifyOption', 'ENFORCEMENT_REQUESTS')
    .replace(':queryId', '1')
    .replace(':documentId', '2')
    .replace(':uniqueId', '3')
    .replace(':tab', '4');
}

export interface CaptureServer {
  baseUrl: string;
  close: () => Promise<void>;
}

// Serve captures with the same built assets used by the application. A missing
// build must fail setup rather than silently test an unstyled page.
export async function startCaptureServer(urls: string[], options: {port?: number; publicDirectory?: string} = {}): Promise<CaptureServer> {
  const app = express();
  app.use(express.static(options.publicDirectory ?? path.resolve(__dirname, '../../main/public')));
  for (const url of urls) {
    app.get(captureUrl(url), async (_req, res, next) => {
      try {
        const html = await readFile(translateUrlToFilePath(captureUrl(url)), 'utf8');
        // The real i18n middleware supplies this cookie. Static captures must
        // supply it too when exercising the language script in the built bundle.
        const language = html.match(/<html\b[^>]*\blang=["'](en|cy)["']/i)?.[1];
        if (language) res.cookie('lang', language, {sameSite: 'lax'});
        res.type('html').send(html);
      } catch (error) {
        next(error);
      }
    });
  }
  const server: Server = createServer(app);
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(options.port ?? 0, '127.0.0.1', () => {
      server.removeListener('error', reject);
      resolve();
    });
  });
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Accessibility capture server has no TCP address');
  const baseUrl = `http://127.0.0.1:${address.port}`;
  let closing: Promise<void>;
  const close = () => closing ??= new Promise<void>((resolve, reject) => {
    server.close(error => error ? reject(error) : resolve());
    server.closeIdleConnections();
  });
  try {
    for (const [asset, contentType] of [['main-dev.css', /text\/css/], ['main-dev.js', /(?:text|application)\/javascript/]] as const) {
      // A readiness probe belongs to this server, not fetch's process-wide
      // keep-alive pool (which can retain a socket from a closed test server).
      await new Promise<void>((resolve, reject) => {
        const request = get(`${baseUrl}/${asset}`, {agent: false}, response => {
          response.on('error', reject);
          response.resume();
          response.on('end', () => {
            if (response.statusCode !== 200 || !contentType.test(response.headers['content-type'] ?? '')) {
              reject(new Error(`Accessibility requires built /${asset} (HTTP ${response.statusCode}). Run the development build first.`));
            } else {
              resolve();
            }
          });
        });
        request.on('error', reject);
      });
    }
    return {baseUrl, close};
  } catch (error) {
    await close();
    throw error;
  }
}
