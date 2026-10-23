export const MINIMAL_PDF_BUFFER = Buffer.from('%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n');
export const MINIMAL_PNG_BUFFER = Buffer.from([
  0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
  0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
]);
export const MINIMAL_JPEG_BUFFER = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46]);
export const MINIMAL_BMP_BUFFER = Buffer.from([0x42, 0x4D, 0x00, 0x00, 0x00, 0x00]);
export const MINIMAL_TIFF_BUFFER = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x00, 0x00, 0x00, 0x00]);
export const MINIMAL_RTF_BUFFER = Buffer.from('{\\rtf1\\ansi test}');
export const MINIMAL_OLE_BUFFER = Buffer.from([0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1, 0x00, 0x00]);
export const SPOOFED_PDF_BUFFER = Buffer.from('This is not a real PDF. There is no PDF signature at the start of this file.\n');
export const PLAIN_TEXT_BUFFER = Buffer.from('Test file content');

/** Minimal ZIP local-file header embedding an OOXML path marker for detection tests. */
export const MINIMAL_DOCX_BUFFER = Buffer.concat([
  Buffer.from([0x50, 0x4B, 0x03, 0x04]),
  Buffer.alloc(26),
  Buffer.from('word/document.xml'),
]);
