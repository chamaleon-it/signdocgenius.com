import assert from 'node:assert/strict';
import test from 'node:test';
import { PDFDocument } from 'pdf-lib';
import { parsePdfTextFieldValues, setPdfTextFieldValues } from '../src/lib/pdf-form-fields.ts';

test('parses bounded PDF text-field values', () => {
  assert.deepEqual(
    parsePdfTextFieldValues({ 'Buyer.Name': 'Ian Stewart', 'Buyer.Address': '' }),
    { 'Buyer.Name': 'Ian Stewart', 'Buyer.Address': '' }
  );
  assert.equal(parsePdfTextFieldValues([]), null);
  assert.equal(parsePdfTextFieldValues({ name: 123 }), null);
  assert.equal(parsePdfTextFieldValues({ ['a'.repeat(257)]: 'value' }), null);
});

test('applies only values for existing text fields', async () => {
  const pdfDoc = await PDFDocument.create();
  const form = pdfDoc.getForm();
  const buyerName = form.createTextField('Buyer.Name');
  buyerName.setText('Old name');
  buyerName.addToPage(pdfDoc.addPage());

  assert.equal(setPdfTextFieldValues(pdfDoc, { 'Buyer.Name': 'New name' }), true);
  assert.equal(form.getTextField('Buyer.Name').getText(), 'New name');
  assert.equal(setPdfTextFieldValues(pdfDoc, { 'Missing.Field': 'value' }), false);
  assert.equal(form.getTextField('Buyer.Name').getText(), 'New name');

  const savedPdf = await PDFDocument.load(await pdfDoc.save());
  assert.equal(savedPdf.getForm().getTextField('Buyer.Name').getText(), 'New name');
});
