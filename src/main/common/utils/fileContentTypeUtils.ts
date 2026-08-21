import {ALLOWED_MIME_TYPES} from 'form/validators/isAllowedMimeType';

const PDF_MIME = 'application/pdf';
const JPEG_MIME = 'image/jpeg';
const PNG_MIME = 'image/png';
const BMP_MIME = 'image/bmp';
const TIFF_MIME = 'image/tiff';
const RTF_MIMES = ['application/rtf', 'text/rtf'] as const;
const LEGACY_OFFICE_MIMES = [
  'application/msword',
  'application/vnd.ms-excel',
  'application/vnd.ms-powerpoint',
] as const;
const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const PPTX_MIME = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
const TEXT_MIMES = ['text/plain', 'text/csv'] as const;

const OLE_CFB_MIME = 'application/x-cfb';
const OPEN_XML_SCAN_BYTES = 8192;

const toBuffer = (value: Buffer | ArrayBuffer | Uint8Array): Buffer => {
  if (Buffer.isBuffer(value)) {
    return value;
  }
  if (value instanceof ArrayBuffer) {
    return Buffer.from(value);
  }
  return Buffer.from(value.buffer, value.byteOffset, value.byteLength);
};

const startsWithBytes = (buffer: Buffer, signature: number[]): boolean => {
  if (buffer.length < signature.length) {
    return false;
  }
  return signature.every((byte, index) => buffer[index] === byte);
};

const isRtf = (buffer: Buffer): boolean => {
  const start = buffer.subarray(0, Math.min(buffer.length, 16)).toString('latin1').trimStart();
  return start.startsWith('{\\rtf');
};

const isPdf = (buffer: Buffer): boolean => {
  const head = buffer.subarray(0, Math.min(buffer.length, 1024)).toString('latin1').trimStart();
  return head.startsWith('%PDF-');
};

const detectOpenXmlMime = (buffer: Buffer): string | undefined => {
  if (!startsWithBytes(buffer, [0x50, 0x4B])) {
    return undefined;
  }
  const scanWindow = buffer.subarray(0, Math.min(buffer.length, OPEN_XML_SCAN_BYTES)).toString('latin1');
  if (scanWindow.includes('word/')) {
    return DOCX_MIME;
  }
  if (scanWindow.includes('xl/')) {
    return XLSX_MIME;
  }
  if (scanWindow.includes('ppt/')) {
    return PPTX_MIME;
  }
  return undefined;
};

/**
 * Detects MIME type from file magic bytes / signatures.
 * Returns undefined when no recognised binary signature is found.
 */
export const detectMimeTypeFromBuffer = (value: Buffer | ArrayBuffer | Uint8Array): string | undefined => {
  const buffer = toBuffer(value);
  if (buffer.length === 0) {
    return undefined;
  }

  if (isPdf(buffer)) {
    return PDF_MIME;
  }
  if (startsWithBytes(buffer, [0xFF, 0xD8, 0xFF])) {
    return JPEG_MIME;
  }
  if (startsWithBytes(buffer, [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])) {
    return PNG_MIME;
  }
  if (startsWithBytes(buffer, [0x42, 0x4D])) {
    return BMP_MIME;
  }
  if (startsWithBytes(buffer, [0x49, 0x49, 0x2A, 0x00]) || startsWithBytes(buffer, [0x4D, 0x4D, 0x00, 0x2A])) {
    return TIFF_MIME;
  }
  if (isRtf(buffer)) {
    return 'application/rtf';
  }
  if (startsWithBytes(buffer, [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1])) {
    return OLE_CFB_MIME;
  }

  return detectOpenXmlMime(buffer);
};

const isTextLike = (buffer: Buffer): boolean => {
  if (buffer.includes(0)) {
    return false;
  }
  // Reject high ratios of non-printable control characters (excluding common whitespace).
  let suspicious = 0;
  const sampleLength = Math.min(buffer.length, 512);
  for (let i = 0; i < sampleLength; i++) {
    const byte = buffer[i];
    const isControl = byte < 0x09 || (byte > 0x0D && byte < 0x20) || byte === 0x7F;
    if (isControl) {
      suspicious++;
    }
  }
  return suspicious / sampleLength < 0.1;
};

const areMimeTypesCompatible = (detectedMime: string, declaredMime: string): boolean => {
  if (detectedMime === declaredMime) {
    return true;
  }
  if (detectedMime === 'application/rtf' && (RTF_MIMES as readonly string[]).includes(declaredMime)) {
    return true;
  }
  if (detectedMime === OLE_CFB_MIME && (LEGACY_OFFICE_MIMES as readonly string[]).includes(declaredMime)) {
    return true;
  }
  return false;
};

/**
 * Validates that file content matches an allowlisted type, independent of a spoofable Content-Type header.
 * Declared MIME must still be allowlisted (first-pass filter); content signature must also match.
 */
export const isFileContentAllowed = (
  value: Buffer | ArrayBuffer | Uint8Array | undefined | null,
  declaredMimeType: string | undefined | null,
): boolean => {
  if (!value || !declaredMimeType || !ALLOWED_MIME_TYPES.includes(declaredMimeType)) {
    return false;
  }

  const buffer = toBuffer(value);
  if (buffer.length === 0) {
    return false;
  }

  const detectedMime = detectMimeTypeFromBuffer(buffer);
  if (detectedMime) {
    return areMimeTypesCompatible(detectedMime, declaredMimeType);
  }

  if ((TEXT_MIMES as readonly string[]).includes(declaredMimeType)) {
    return isTextLike(buffer);
  }

  // Binary allowlisted type declared, but no matching signature found.
  return false;
};

export const createInvalidFileContentError = (): {code: string; message: string} => ({
  code: 'LIMIT_UNEXPECTED_FILE',
  message: 'File content type is not allowed',
});
