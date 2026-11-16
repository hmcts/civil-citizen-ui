import {YesNoUpperCamelCase} from 'form/models/yesNo';
import {FormattedDocument, QueryDetail, QueryListItem, ViewObjects} from 'form/models/queryManagement/viewQuery';

describe('viewQuery models', () => {
  it('stores view, document, list item and detail fields', () => {
    const view = new ViewObjects('id-1', 'claimant', 'subject', 'sent', 'defendant', 'updated', 'open');
    const document = new FormattedDocument('letter.pdf', '/documents/letter.pdf');
    const item = new QueryListItem('details', YesNoUpperCamelCase.YES, [document], 'court', 'Court', '2024-01-01', '1 January 2024', true, '2024-02-01');
    const detail = new QueryDetail('title', 'open', [item], false, '');

    expect(view).toMatchObject({id: 'id-1', createdBy: 'claimant', status: 'open'});
    expect(document).toMatchObject({fileName: 'letter.pdf', documentUrl: '/documents/letter.pdf'});
    expect(item.hearingDate).toBe('2024-02-01');
    expect(detail.items).toEqual([item]);
  });
});
