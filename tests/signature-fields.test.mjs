import assert from 'node:assert/strict';
import test from 'node:test';
import { getFieldSignatures } from '../src/lib/signature-fields.ts';

test('each configured position requires its own submitted image', async () => {
  const fields = ['first', 'second', 'third'].map((id) => ({ id, page: 1, x: 0, y: 0, width: 0.1, height: 0.1 }));
  const form = new FormData();
  for (const field of fields) {
    form.append(`signature:${field.id}`, new File([field.id], `${field.id}.png`, { type: 'image/png' }));
  }

  const signatures = getFieldSignatures(form, fields);
  assert.ok(signatures);
  assert.deepEqual(await Promise.all(signatures.map((file) => file.text())), ['first', 'second', 'third']);

  form.delete('signature:second');
  assert.equal(getFieldSignatures(form, fields), null);
});
