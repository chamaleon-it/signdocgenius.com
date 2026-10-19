export interface SignatureField {
  id: string;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export function fitSignatureToField(
  fieldWidth: number,
  fieldHeight: number,
  imageWidth: number,
  imageHeight: number
) {
  const scale = Math.min(fieldWidth / imageWidth, fieldHeight / imageHeight);
  const width = imageWidth * scale;
  const height = imageHeight * scale;

  return {
    x: (fieldWidth - width) / 2,
    y: (fieldHeight - height) / 2,
    width,
    height,
  };
}

export function parseSignatureFields(
  value: unknown,
  pageCount?: number
): SignatureField[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > 100) {
    return null;
  }

  const fields: SignatureField[] = [];
  const ids = new Set<string>();

  for (const item of value) {
    if (
      typeof item !== 'object' ||
      item === null ||
      !('id' in item) ||
      !('page' in item) ||
      !('x' in item) ||
      !('y' in item) ||
      !('width' in item) ||
      !('height' in item)
    ) {
      return null;
    }

    const field = item as Record<string, unknown>;
    const { id, page, x, y, width, height } = field;
    if (
      typeof id !== 'string' ||
      id.length === 0 ||
      id.length > 128 ||
      ids.has(id) ||
      typeof page !== 'number' ||
      !Number.isInteger(page) ||
      page < 1 ||
      (pageCount !== undefined && page > pageCount) ||
      typeof x !== 'number' ||
      typeof y !== 'number' ||
      typeof width !== 'number' ||
      typeof height !== 'number' ||
      !Number.isFinite(x) ||
      !Number.isFinite(y) ||
      !Number.isFinite(width) ||
      !Number.isFinite(height) ||
      x < 0 ||
      y < 0 ||
      width <= 0 ||
      height <= 0 ||
      x + width > 1 ||
      y + height > 1
    ) {
      return null;
    }

    ids.add(id);
    fields.push({ id, page, x, y, width, height });
  }

  return fields;
}
