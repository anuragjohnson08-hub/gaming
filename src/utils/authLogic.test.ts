import test from 'node:test';
import assert from 'node:assert/strict';
import {
  authenticateUserFromStore,
  registerUserInStore,
  StoredUserRecord,
  validateLoginInput,
  validateSignUpInput,
} from './authLogic';

test('validateSignUpInput rejects empty or invalid fields', () => {
  assert.equal(validateSignUpInput('', 'test@nexus.io', 'secret123').valid, false);
  assert.equal(validateSignUpInput('Alex', 'not-an-email', 'secret123').valid, false);
  assert.equal(validateSignUpInput('Alex', 'alex@nexus.io', '123').valid, false);
  assert.equal(validateSignUpInput('Alex Chen', 'alex@nexus.io', 'secret123').valid, true);
});

test('validateLoginInput rejects empty credentials', () => {
  assert.equal(validateLoginInput('', 'secret123').valid, false);
  assert.equal(validateLoginInput('alex@nexus.io', '').valid, false);
  assert.equal(validateLoginInput('alex@nexus.io', 'secret123').valid, true);
});

test('registerUserInStore and authenticateUserFromStore handle full lifecycle and duplicate checks', () => {
  const initialStore: StoredUserRecord[] = [];

  const reg1 = registerUserInStore(initialStore, {
    name: 'Aarav Sharma',
    email: 'aarav@nexus.gg',
    password: 'password2026',
    initialSavedIds: ['gpu-rtx-5070'],
  });

  assert.equal(reg1.success, true);
  assert.ok(reg1.user);
  assert.equal(reg1.user.name, 'Aarav Sharma');
  assert.deepEqual(reg1.user.savedItemIds, ['gpu-rtx-5070']);

  // Duplicate email must fail
  const regDup = registerUserInStore(reg1.updatedUsers, {
    name: 'Another Name',
    email: 'AARAV@nexus.gg',
    password: 'password2026',
  });
  assert.equal(regDup.success, false);

  // Wrong password login must fail
  const badLogin = authenticateUserFromStore(
    reg1.updatedUsers,
    'aarav@nexus.gg',
    'wrongpass'
  );
  assert.equal(badLogin.success, false);

  // Valid login succeeds and restores saved items
  const goodLogin = authenticateUserFromStore(
    reg1.updatedUsers,
    'AARAV@nexus.gg',
    'password2026'
  );
  assert.equal(goodLogin.success, true);
  assert.equal(goodLogin.user?.email, 'aarav@nexus.gg');
  assert.deepEqual(goodLogin.user?.savedItemIds, ['gpu-rtx-5070']);
});
