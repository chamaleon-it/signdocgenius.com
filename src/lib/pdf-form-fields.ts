import { PDFTextField, type PDFDocument } from 'pdf-lib';

export type PdfTextFieldValues = Record<string, string>;

export function parsePdfTextFieldValues(value: unknown): PdfTextFieldValues | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return null;
  }

  const entries = Object.entries(value);
  if (entries.length > 100) {
    return null;
  }

  const values: PdfTextFieldValues = Object.fromEntries(entries);
  for (const [name, fieldValue] of entries) {
    if (
      name.length === 0 ||
      name.length > 256 ||
      typeof fieldValue !== 'string' ||
      fieldValue.length > 10_000
    ) {
      return null;
    }
  }

  return values;
}

export function setPdfTextFieldValues(
  pdfDoc: PDFDocument,
  values: PdfTextFieldValues
): boolean {
  if (Object.keys(values).length === 0) {
    return true;
  }

  const fields = new Map(pdfDoc.getForm().getFields().map((field) => [field.getName(), field]));
  const updates: Array<[PDFTextField, string]> = [];

  for (const [name, value] of Object.entries(values)) {
    const field = fields.get(name);
    if (!(field instanceof PDFTextField)) {
      return false;
    }
    const maxLength = field.getMaxLength();
    if (maxLength !== undefined && value.length > maxLength) {
      return false;
    }
    updates.push([field, value]);
  }

  for (const [field, value] of updates) {
    field.setText(value);
  }

  return true;
}
