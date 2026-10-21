const crypto = require('crypto');
const readline = require('readline');

// Create hashes for email addresses (whitelisted)
const whitelistedEmails = [
  'amy@example.com',
  'jenna@example.com',
  'tanay@example.com'
];

// Hash the whitelisted email addresses using SHA-256
const hashedEmails = whitelistedEmails.map(email =>
  crypto.createHash('sha256').update(email).digest('hex')
);

function hashPair(left, right) {
  return crypto.createHash('sha256').update(left + right).digest('hex');
}

// Build the tree as levels (array of arrays) for sibling lookup.
// Level 0 = leaves; last level = [root].
function buildMerkleLevels(hashes) {
  const levels = [hashes.slice()];
  while (levels[levels.length - 1].length > 1) {
    const current = levels[levels.length - 1];
    const next = [];
    for (let i = 0; i < current.length; i += 2) {
      const left = current[i];
      const right = i + 1 < current.length ? current[i + 1] : '';
      next.push(hashPair(left, right));
    }
    levels.push(next);
  }
  return levels;
}

// Function to construct a Merkle Tree from a list of hashes (same pairing rule as before)
function constructMerkleTree(hashes) {
  // If there's only one hash, it's the root of the tree
  if (hashes.length === 1) {
    return hashes[0];
  }

  const newHashes = [];

  // Combine hashes in pairs and hash the result to create the next level of the tree
  for (let i = 0; i < hashes.length; i += 2) {
    const left = hashes[i];
    const right = i + 1 < hashes.length ? hashes[i + 1] : '';
    const combined = hashPair(left, right);
    newHashes.push(combined);
  }

  // Recursively construct the next level of the tree
  return constructMerkleTree(newHashes);
}

const merkleLevels = buildMerkleLevels(hashedEmails);
const rootHash = constructMerkleTree(hashedEmails);

// Proof step: { sibling, position: 'left' | 'right' }
// position 'left'  → verify with sha256(sibling + current)
// position 'right' → verify with sha256(current + sibling)
// Odd leftover node: sibling is '' and position is 'right' (matches build rule).
function getProof(leafIndex) {
  if (leafIndex < 0 || leafIndex >= merkleLevels[0].length) {
    return null;
  }

  const proof = [];
  let index = leafIndex;

  for (let level = 0; level < merkleLevels.length - 1; level++) {
    const layer = merkleLevels[level];
    const isRightChild = index % 2 === 1;

    if (isRightChild) {
      proof.push({ sibling: layer[index - 1], position: 'left' });
    } else if (index + 1 < layer.length) {
      proof.push({ sibling: layer[index + 1], position: 'right' });
    } else {
      // Odd leftover: paired with empty string on the right
      proof.push({ sibling: '', position: 'right' });
    }

    index = Math.floor(index / 2);
  }

  return proof;
}

function verifyProof(leafHash, proof, root) {
  let current = leafHash;
  for (const { sibling, position } of proof) {
    if (position === 'left') {
      current = hashPair(sibling, current);
    } else {
      current = hashPair(current, sibling);
    }
  }
  return current === root;
}

function leafIndexOf(email) {
  const hash = crypto.createHash('sha256').update(email).digest('hex');
  return hashedEmails.indexOf(hash);
}

function runDemo() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Enter the email address to check: ', (email) => {
    const providedHash = crypto.createHash('sha256').update(email).digest('hex');
    const leafIndex = hashedEmails.indexOf(providedHash);

    if (leafIndex === -1) {
      console.log('Email address is not whitelisted!');
    } else {
      const proof = getProof(leafIndex);
      const ok = verifyProof(providedHash, proof, rootHash);

      console.log('Email address is whitelisted!');
      console.log('Merkle proof:');
      proof.forEach((step, i) => {
        const sib = step.sibling === '' ? "(empty string '')" : step.sibling;
        console.log(`  step ${i + 1}: sibling=${sib} position=${step.position}`);
      });
      if (ok) {
        console.log('Proof verified against the root');
      } else {
        console.log('Proof failed verification against the root');
      }
    }

    rl.close();
  });
}

module.exports = {
  whitelistedEmails,
  hashedEmails,
  merkleLevels,
  rootHash,
  hashPair,
  buildMerkleLevels,
  constructMerkleTree,
  getProof,
  verifyProof,
  leafIndexOf
};

if (require.main === module) {
  runDemo();
}
