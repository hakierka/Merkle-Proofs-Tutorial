// Import a cryptographic library (e.g., crypto-js) for hashing.
const crypto = require('crypto-js');

// Sample data (email addresses).
const data = ['alice@example.com', 'bob@example.com', 'charlie@example.com'];

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

// Example usage:
const root = createMerkleTree(data);
const itemToProve = 'alice@example.com';
const proof = generateMerkleProof(data, itemToProve);

console.log('Root of the Merkle Tree:', root);
console.log('Merkle Proof for', itemToProve, ':', proof);
