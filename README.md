# Merkle-Proofs-Tutorial

A small JavaScript demo that builds a Merkle tree from a whitelist of emails, then checks whether an input email is on that list.

The program does **not** generate or verify a sibling-path Merkle proof. Membership is checked by hashing the input and looking it up in the leaf-hash list.

## What the demo does

In `code/merkle.js`:

1. Hash each whitelisted email with SHA-256 (leaves).
2. Build a Merkle tree by pairing hashes and hashing each pair until one root remains (`constructMerkleTree`).
3. Prompt for an email, hash it, and check whether that hash is in the leaf list (`hashedEmails.includes(...)`).

The root is computed but not used in the membership check.

## Merkle proofs (concept only)

A Merkle proof is the sibling hashes on the path from a leaf to the root. With the root and that path, you can recompute hashes up the tree and check membership without the full leaf list.

This repo’s code does not build or check that path. The sketch below is only for reading.

With three leaves, `constructMerkleTree` pairs `amy` with `jenna`, then hashes the leftover `tanay` leaf with an empty string (`right = ''`) — it does not duplicate the last hash or carry it up unchanged:

```
                 root
                /    \
     H(amy+jenna)    H(tanay+"")
       /      \            \
   H(amy)  H(jenna)     H(tanay)
```

H(x+y) means SHA-256 of the two child hashes joined together; a leaf H(name) is SHA-256 of the email string.

A conceptual proof for `amy` would supply, step by step: (1) sibling `H(jenna)` to form `H(amy+jenna)`, then (2) sibling `H(tanay+"")` to form the root. The code here does not generate or verify that path.

## Prerequisites

- Node.js and npm

## Run it

```
git clone https://github.com/hakierka/Merkle-Proofs-Tutorial.git
cd Merkle-Proofs-Tutorial
npm install
npm start
```

Verified output (after typing `amy@example.com`):

```
> Merkle-Proofs-Tutorial@1.0.0 start
> node code/merkle.js

Enter the email address to check: Email address is whitelisted!
```

For an address not on the list (e.g. `nobody@example.com`):

```
Enter the email address to check: Email address is not whitelisted!
```

![Enter prompt](image/enter.jpg)

## Code

- `code/merkle.js` — builds a Merkle tree from hashed emails and checks whether an input email is on the whitelist (list lookup, not a Merkle proof)
- `package.json` — `npm start` runs `node code/merkle.js`

Default whitelist in `code/merkle.js`:

```
const whitelistedEmails = [
  'amy@example.com',
  'jenna@example.com',
  'tanay@example.com'
];
```

Change that array to try other addresses.

## License

MIT — see [LICENSE](LICENSE).
