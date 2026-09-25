import {join} from 'path';
import {configure} from 'nunjucks';
import {summaryRow, summaryRowHtml} from 'models/summaryList/summaryList';

describe('summaryRow', () => {
  const nunjucks = configure([
    join(process.cwd(), 'node_modules', 'govuk-frontend', 'dist'),
  ], {autoescape: true});

  const renderSummaryRow = (row: ReturnType<typeof summaryRow>): string =>
    nunjucks.renderString(`
      {% from "govuk/components/summary-list/macro.njk" import govukSummaryList %}
      {{ govukSummaryList({ rows: rows }) }}
    `, {rows: [row]});

  it('renders angle brackets in a plain value as literal text', () => {
    const row = summaryRow('Evidence', '<strong>literal text</strong>');

    const rendered = renderSummaryRow(row);

    expect(row.value).toEqual({html: '&lt;strong&gt;literal text&lt;/strong&gt;'});
    expect(rendered).toContain('&lt;strong&gt;literal text&lt;/strong&gt;');
    expect(rendered).not.toContain('<strong>literal text</strong>');
  });

  it('renders markup only when the HTML variant is used explicitly', () => {
    const row = summaryRowHtml('Address', '1 Main Street<br>London');

    const rendered = renderSummaryRow(row);

    expect(row.value).toEqual({html: '1 Main Street<br>London'});
    expect(rendered).toContain('1 Main Street<br>London');
  });
});
