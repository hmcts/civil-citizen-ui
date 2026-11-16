import {escapeHtml, escapedListItem, escapedParagraph} from 'common/utils/escapeHtml';

describe('escapeHtml', () => {
  it('should escape HTML special characters', () => {
    expect(escapeHtml('<script>alert("x")</script> & \'y\'')).toEqual(
      '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; &#039;y&#039;',
    );
  });

  it('should return empty string for undefined', () => {
    expect(escapeHtml(undefined)).toEqual('');
  });

  it('should return empty string for null', () => {
    expect(escapeHtml(null as unknown as string)).toEqual('');
  });

  it('should return empty string for non-string values', () => {
    expect(escapeHtml(123 as unknown as string)).toEqual('');
  });

  it('should leave plain text unchanged', () => {
    expect(escapeHtml('hello world')).toEqual('hello world');
  });
});

describe('escapedParagraph', () => {
  it('should wrap escaped text in default govuk body paragraph', () => {
    expect(escapedParagraph('<b>hi</b>')).toEqual('<p class="govuk-body">&lt;b&gt;hi&lt;/b&gt;</p>');
  });

  it('should allow custom classes', () => {
    expect(escapedParagraph('text', 'govuk-body-s')).toEqual('<p class="govuk-body-s">text</p>');
  });

  it('should handle undefined text', () => {
    expect(escapedParagraph(undefined)).toEqual('<p class="govuk-body"></p>');
  });
});

describe('escapedListItem', () => {
  it('should wrap escaped text in a list item', () => {
    expect(escapedListItem('a & b')).toEqual('<li>a &amp; b</li>');
  });

  it('should handle undefined text', () => {
    expect(escapedListItem(undefined)).toEqual('<li></li>');
  });
});
