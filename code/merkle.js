// Import functions and classes from other-files.js
const {
  calculateMerkleHash,
  MerkleProof,
  merkleConfig,
  handleMerkleError,
} = require('./other-files.js'); // Use the correct path if needed

// Import a cryptographic library (e.g., crypto-js) for hashing.
const crypto = require('crypto-js');

// Sample data (email addresses).
const data = ['amy@example.com', 'jenna@example.com', 'tanay@example.com'];

// Function to create a Merkle Tree.
function createMerkleTree(data) {
  if (data.length % 2 !== 0) {
    // Make sure the data has an even number of elements.
    data.push(data[data.length - 1]);
  }

  const tree = [];

  // Calculate leaf nodes (hashes of data items).
  for (let item of data) {
    const hash = crypto.SHA256(item).toString();
    tree.push(hash);
  }

  // Build the tree by hashing pairs of nodes until we have a root node.
  while (tree.length > 1) {
    const level = [];
    for (let i = 0; i < tree.length; i += 2) {
      const left = tree[i];
      const right = tree[i + 1];
      const combined = crypto.SHA256(left + right).toString();
      level.push(combined);
    }
    tree.length = 0; // Clear the old tree level.
    Array.prototype.push.apply(tree, level); // Add the new level.
  }

  return tree[0]; // The root of the Merkle Tree.
}

// Function to generate a Merkle Proof for a specific data item.
function generateMerkleProof(data, item) {
  const index = data.indexOf(item);

  if (index === -1) {
    return null; // Item not found in the data.
  }

  const tree = createMerkleTree(data);
  const proof = [];

  let currentIndex = index;
  for (let i = 0; i < tree.length / 2; i++) {
    const siblingIndex = currentIndex % 2 === 0 ? currentIndex + 1 : currentIndex - 1;
    proof.push(tree[siblingIndex]);
    currentIndex = Math.floor(currentIndex / 2) + Math.floor(data.length / 2);
  }

  return proof;
}

// Function to verify a Merkle Proof.
function verifyMerkleProof(data, item, root, proof) {
  const calculatedRoot = createMerkleTree(data);

  // Compare the calculated root with the provided root.
  if (calculatedRoot === root) {
    // If they match, the item is whitelisted.
    return true;
  } else {
    // If they don't match, verify the proof.
    const proofHash = proof.reduce((currentHash, siblingHash) => {
      return calculateMerkleHash(currentHash, siblingHash);
    }, crypto.SHA256(item).toString());

    // If the proofHash matches the root, the item is whitelisted.
    return proofHash === root;
  }
}

// Example usage:
const root = createMerkleTree(data);
const itemToProve = 'amy@example.com';
const proof = generateMerkleProof(data, itemToProve);

console.log('Root of the Merkle Tree:', root);
console.log('Merkle Proof for', itemToProve, ':', proof);

// Verify if the item is whitelisted
const isWhitelisted = verifyMerkleProof(data, itemToProve, root, proof);
console.log('Is', itemToProve, 'whitelisted?', isWhitelisted);
