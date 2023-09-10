const crypto = require('crypto');
const readline = require('readline');

// Create hashes for email addresses (whitelisted)
const whitelistedEmails = [
  'amy@example.com',
  'jenna@example.com',
  'tanay@example.com'
];

const hashedEmails = whitelistedEmails.map(email =>
  crypto.createHash('sha256').update(email).digest('hex')
);

// Construct the Merkle Tree
const rootHash = constructMerkleTree(hashedEmails);

// Create an interface to get user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Prompt the user for an email address to check
rl.question('Enter the email address to check: ', (email) => {
  const providedHash = crypto.createHash('sha256').update(email).digest('hex');

  // Verify the Merkle Proof
  let currentHash = providedHash;

  if (hashedEmails.includes(currentHash)) {
    console.log('Email address is whitelisted!');
  } else {
    console.log('Email address is not whitelisted!');
  }

  rl.close();
});

// Function to construct a Merkle Tree
function constructMerkleTree(hashes) {
  if (hashes.length === 1) {
    return hashes[0];
  }

  const newHashes = [];

  for (let i = 0; i < hashes.length; i += 2) {
    const left = hashes[i];
    const right = i + 1 < hashes.length ? hashes[i + 1] : '';
    const combined = crypto.createHash('sha256').update(left + right).digest('hex');
    newHashes.push(combined);
  }

  return constructMerkleTree(newHashes);
}
