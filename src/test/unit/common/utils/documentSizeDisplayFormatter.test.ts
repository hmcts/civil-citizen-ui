import {displayDocumentSizeInKB} from 'common/utils/documentSizeDisplayFormatter';

describe('displayDocumentSizeInKB', () => {
  it('should return zero KB for an empty document', () => {
    expect(displayDocumentSizeInKB(0)).toBe('0 KB');
  });

  it('should format bytes as KB using the requested decimals', () => {
    expect(displayDocumentSizeInKB(1536, 1)).toBe('1.5 KB');
  });

  it('should clamp negative decimal places to zero', () => {
    expect(displayDocumentSizeInKB(1536, -1)).toBe('2 KB');
  });

  it('should use zero decimal places when decimals are absent', () => {
    expect(displayDocumentSizeInKB(1024)).toBe('1 KB');
  });
});
