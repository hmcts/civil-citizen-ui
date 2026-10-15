import * as path from 'path';
import * as nunjucks from 'nunjucks';
import {ClaimSummaryType} from 'common/form/models/claimSummarySection';

/**
 * Renders the UPLOAD_ARRAY block of features/dashboard/item-content.njk, used by the hearing and
 * mediation upload documents pages. The translation function returns the key, so assertions use keys.
 */
describe('item-content.njk UPLOAD_ARRAY', () => {
  let env: nunjucks.Environment;

  beforeAll(() => {
    env = nunjucks.configure([
      path.join(process.cwd(), 'src/main/views'),
      path.join(process.cwd(), 'node_modules/govuk-frontend/dist'),
    ], {autoescape: true});
    env.addGlobal('ClaimSummaryType', ClaimSummaryType);
  });

  const render = (documentNames: string[]) => env.renderString(
    '{% from "features/dashboard/item-content.njk" import itemContent %}{{ itemContent(content, t) }}',
    {
      t: (key: string) => key,
      content: {
        type: ClaimSummaryType.UPLOAD_ARRAY,
        data: {category: 'witnessStatement', index: 0, field: 'fileUpload', text: 'PAGES.UPLOAD_DOCUMENTS.UPLOAD', documentNames},
      },
    },
  );

  const count = (html: string, text: string) => html.split(text).length - 1;

  it('shows one empty upload box and "No file uploaded" when nothing is uploaded', () => {
    const html = render([]);

    expect(count(html, 'app-uploaded-file-slot"')).toBe(0);
    expect(count(html, 'class="row-container')).toBe(1);
    expect(html).not.toContain('data-has-uploaded-files');
    expect(html).toContain('PAGES.UPLOAD_DOCUMENTS.NO_FILE_UPLOADED');
  });

  it('shows a read-only section and a Delete row for each uploaded file', () => {
    const html = render(['statement.pdf', 'evidence.png']);

    expect(count(html, 'app-uploaded-file-slot"')).toBe(2);
    expect(count(html, 'app-uploaded-file-slot__name">statement.pdf<')).toBe(1);
    expect(count(html, 'app-uploaded-file-slot__name">evidence.png<')).toBe(1);
    expect(count(html, '[deleteFile]')).toBe(2);
    expect(html).toContain('data-has-uploaded-files="true"');
    expect(html).not.toContain('PAGES.UPLOAD_DOCUMENTS.NO_FILE_UPLOADED');
  });

  it('keeps one upload box for adding another file', () => {
    expect(count(render(['statement.pdf']), 'class="row-container')).toBe(1);
  });

  it('escapes file names', () => {
    expect(render(['<script>x</script>.pdf'])).not.toContain('<script>x</script>');
  });
});
