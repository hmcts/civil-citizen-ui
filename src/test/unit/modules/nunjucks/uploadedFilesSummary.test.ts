import {summaryRow, summaryRowHtml, summaryRowWithTextValue} from 'models/summaryList/summaryList';
import {formControlsEnvironment} from '../../../utils/renderFormControls';
const {JSDOM} = require('jsdom');

function render(rows: unknown[], submit = false) {
  return new JSDOM(formControlsEnvironment().renderString('{% from "macro/uploaded-files-summary.njk" import uploadedFilesSummary %}<form>{{ uploadedFilesSummary(rows, "Remove", submit) }}</form>', {rows, submit}));
}
const hostile = 'a" & <img src=x onerror="alert(1)" alt="">.pdf';
it('renders text identifiers literally and retains exact query submit-removal values', () => {
  const dom = render([summaryRowWithTextValue(hostile, '2')], true);
  try {
    const doc = dom.window.document;
    expect(doc.querySelector('dt').textContent.trim()).toBe(hostile);
    expect(doc.querySelector('button').value).toBe('[2][deleteFile]');
    expect(doc.querySelector('button').type).toBe('submit');
    expect(doc.querySelector('button').textContent).toContain(hostile);
    expect(doc.querySelector('img,[onerror]')).toBeNull();
    expect(doc.querySelectorAll('dl > div > dt')).toHaveLength(1);
  } finally {dom.window.close();}
});
it('preserves descriptions, trusted producer HTML and distinct link destinations without double escaping', () => {
  const dom = render([summaryRowWithTextValue('Description', hostile), summaryRow(hostile, '', '/remove?id=1&role=applicant'), summaryRowHtml('Trusted', '<strong>Prepared markup</strong>')]);
  try {
    const doc = dom.window.document;
    expect(doc.querySelector('dd').textContent.trim()).toBe(hostile);
    expect(doc.querySelector('a').getAttribute('href')).toBe('/remove?id=1&role=applicant');
    expect(doc.querySelector('strong').textContent).toBe('Prepared markup');
    expect(doc.querySelector('img,[onerror]')).toBeNull();
    expect(doc.querySelectorAll('dt')).toHaveLength(3);
  } finally {dom.window.close();}
});
it.each([{rows: []}, {rows: undefined}])('does not emit an empty summary list', ({rows}: {rows?: unknown[]}) => {
  const dom = render(rows as unknown[]); try {expect(dom.window.document.querySelector('dl')).toBeNull();} finally {dom.window.close();}
});
