import * as path from 'path';
import * as nunjucks from 'nunjucks';

/**
 * Renders the real macro/dynatrace.njk partial. The base templates only include it,
 * so this covers the guard and the emitted markup without needing the application's
 * full nunjucks environment (govuk macros, translation globals and filters).
 */
describe('macro/dynatrace.njk', () => {
  const DYNATRACE_URL = 'https://dt.example/rum.js';
  const USER_ID = '1ab2c3d4-5e6f-7081-92a3-b4c5d6e7f809';
  const EMAIL = 'citizen@example.com';

  let env: nunjucks.Environment;

  beforeAll(() => {
    env = nunjucks.configure([path.join(process.cwd(), 'src/main/views')], {autoescape: true});
  });

  const render = (context: Record<string, unknown> = {}) =>
    env.render('macro/dynatrace.njk', {dynatraceUrl: DYNATRACE_URL, ...context});

  const metaTag = (html: string) => html.match(/<meta name="dt-user-id"[^>]*>/)?.[0];

  it('renders the user id as the correlation key for a signed in user', () => {
    const html = render({user: {id: USER_ID, email: EMAIL}});

    expect(metaTag(html)).toBe(`<meta name="dt-user-id" content="${USER_ID}">`);
  });

  it('omits the meta tag when there is no authenticated session', () => {
    expect(metaTag(render())).toBeUndefined();
  });

  it('omits the meta tag when the user has no id', () => {
    expect(metaTag(render({user: {email: EMAIL}}))).toBeUndefined();
  });

  it('never emits the email address', () => {
    const html = render({user: {id: USER_ID, email: EMAIL}});

    expect(html).not.toContain(EMAIL);
    expect(html).not.toContain('@');
  });

  it('escapes the id rather than emitting it raw', () => {
    const html = render({user: {id: '"><script>alert(1)</script>'}});

    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&quot;&gt;&lt;script&gt;');
  });

  it('always loads the Dynatrace agent, signed in or not', () => {
    expect(render()).toContain(`src="${DYNATRACE_URL}"`);
    expect(render({user: {id: USER_ID}})).toContain(`src="${DYNATRACE_URL}"`);
  });
});
