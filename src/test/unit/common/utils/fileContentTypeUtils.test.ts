import {detectMimeTypeFromBuffer, isFileContentAllowed} from 'common/utils/fileContentTypeUtils';
import {
  MINIMAL_BMP_BUFFER,
  MINIMAL_DOCX_BUFFER,
  MINIMAL_JPEG_BUFFER,
  MINIMAL_OLE_BUFFER,
  MINIMAL_PDF_BUFFER,
  MINIMAL_PNG_BUFFER,
  MINIMAL_RTF_BUFFER,
  MINIMAL_TIFF_BUFFER,
  PLAIN_TEXT_BUFFER,
  SPOOFED_PDF_BUFFER,
} from '../../../utils/fileContentFixtures';

describe('fileContentTypeUtils', () => {
  describe('detectMimeTypeFromBuffer', () => {
    it.each([
      [MINIMAL_PDF_BUFFER, 'application/pdf'],
      [MINIMAL_PNG_BUFFER, 'image/png'],
      [MINIMAL_JPEG_BUFFER, 'image/jpeg'],
      [MINIMAL_BMP_BUFFER, 'image/bmp'],
      [MINIMAL_TIFF_BUFFER, 'image/tiff'],
      [MINIMAL_RTF_BUFFER, 'application/rtf'],
      [MINIMAL_OLE_BUFFER, 'application/x-cfb'],
      [MINIMAL_DOCX_BUFFER, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    ])('detects known signatures', (buffer, expectedMime) => {
      expect(detectMimeTypeFromBuffer(buffer)).toBe(expectedMime);
    });

    it('returns undefined for plain text without a binary signature', () => {
      expect(detectMimeTypeFromBuffer(PLAIN_TEXT_BUFFER)).toBeUndefined();
    });

    it('returns undefined for empty buffer', () => {
      expect(detectMimeTypeFromBuffer(Buffer.alloc(0))).toBeUndefined();
    });
  });

  describe('isFileContentAllowed', () => {
    it('accepts a real PDF declared as application/pdf', () => {
      expect(isFileContentAllowed(MINIMAL_PDF_BUFFER, 'application/pdf')).toBe(true);
    });

    it('rejects a non-PDF payload spoofed as application/pdf', () => {
      expect(isFileContentAllowed(SPOOFED_PDF_BUFFER, 'application/pdf')).toBe(false);
    });

    it('rejects a PNG payload spoofed as application/pdf', () => {
      expect(isFileContentAllowed(MINIMAL_PNG_BUFFER, 'application/pdf')).toBe(false);
    });

    it('accepts plain text when declared as text/plain', () => {
      expect(isFileContentAllowed(PLAIN_TEXT_BUFFER, 'text/plain')).toBe(true);
    });

    it('accepts csv-like text when declared as text/csv', () => {
      expect(isFileContentAllowed(Buffer.from('a,b,c\n1,2,3\n'), 'text/csv')).toBe(true);
    });

    it('rejects binary content declared as text/plain', () => {
      expect(isFileContentAllowed(MINIMAL_PNG_BUFFER, 'text/plain')).toBe(false);
    });

    it('rejects disallowed declared mime even if content matches another type', () => {
      expect(isFileContentAllowed(MINIMAL_PDF_BUFFER, 'application/octet-stream')).toBe(false);
    });

    it('accepts RTF for both application/rtf and text/rtf', () => {
      expect(isFileContentAllowed(MINIMAL_RTF_BUFFER, 'application/rtf')).toBe(true);
      expect(isFileContentAllowed(MINIMAL_RTF_BUFFER, 'text/rtf')).toBe(true);
    });

    it('accepts OLE compound files for legacy Office MIME types', () => {
      expect(isFileContentAllowed(MINIMAL_OLE_BUFFER, 'application/msword')).toBe(true);
      expect(isFileContentAllowed(MINIMAL_OLE_BUFFER, 'application/vnd.ms-excel')).toBe(true);
      expect(isFileContentAllowed(MINIMAL_OLE_BUFFER, 'application/vnd.ms-powerpoint')).toBe(true);
    });

    it('accepts docx signature for docx MIME', () => {
      expect(isFileContentAllowed(MINIMAL_DOCX_BUFFER, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')).toBe(true);
    });

    it('rejects empty buffer', () => {
      expect(isFileContentAllowed(Buffer.alloc(0), 'application/pdf')).toBe(false);
    });

    it('rejects null/undefined inputs', () => {
      expect(isFileContentAllowed(undefined, 'application/pdf')).toBe(false);
      expect(isFileContentAllowed(MINIMAL_PDF_BUFFER, undefined)).toBe(false);
    });
  });
});
