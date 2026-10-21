const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');

const {
  whitelistedEmails,
  hashedEmails,
  rootHash,
  hashPair,
  getProof,
  verifyProof,
  leafIndexOf
} = require('./merkle.js');

describe('Merkle proofs', () => {
  it('every whitelisted email: proof verifies against root', () => {
    for (let i = 0; i < whitelistedEmails.length; i++) {
      const leafHash = hashedEmails[i];
      const proof = getProof(i);
      assert.ok(proof, `expected proof for leaf ${i}`);
      assert.equal(verifyProof(leafHash, proof, rootHash), true);
    }
  });

  it('tampered proof (change one sibling) fails', () => {
    const leafHash = hashedEmails[0];
    const proof = getProof(0).map((step, i) =>
      i === 0
        ? { ...step, sibling: crypto.createHash('sha256').update('tampered').digest('hex') }
        : { ...step }
    );
    assert.equal(verifyProof(leafHash, proof, rootHash), false);
  });

  it('wrong leaf hash fails', () => {
    const proof = getProof(0);
    const wrongLeaf = crypto.createHash('sha256').update('wrong@example.com').digest('hex');
    assert.equal(verifyProof(wrongLeaf, proof, rootHash), false);
  });

  it('email not on list has no proof (no leaf index)', () => {
    const index = leafIndexOf('nobody@example.com');
    assert.equal(index, -1);
    assert.equal(getProof(index), null);
  });

  it('3-leaf amy proof matches README sketch', () => {
    // Leaves: amy(0), jenna(1), tanay(2)
    // Pairing: H(amy+jenna), H(tanay+"")
    // Proof for amy: [H(jenna) right, H(tanay+"") right]
    const hJenna = hashedEmails[1];
    const hTanayPad = hashPair(hashedEmails[2], '');
    const proof = getProof(0);

    assert.deepEqual(proof, [
      { sibling: hJenna, position: 'right' },
      { sibling: hTanayPad, position: 'right' }
    ]);
    assert.equal(verifyProof(hashedEmails[0], proof, rootHash), true);
  });
});
