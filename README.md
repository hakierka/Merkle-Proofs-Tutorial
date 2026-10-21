# Merkle-Proofs-Tutorial

A small JavaScript demo of Merkle trees and membership checks (whitelist-style).

## What you will learn

- What a Merkle tree is and how leaf hashes build up to a root
- How a Merkle proof uses sibling hashes along the path to the root
- How to hash data and walk a simple tree in JavaScript
- How to run a whitelist check from the command line

## How Merkle Proofs Work

1. Hash each data item (leaf).
2. Pair hashes and hash each pair until one root remains.
3. A proof for one leaf is the sibling hashes on the path to the root.
4. Anyone with the root and the proof can recompute the path and check membership.

Example tree for three emails (`amy`, `jenna`, `tanay`):

```
              root
             /    \
          H(a+j)   H(t+)
          /    \      \
       H(amy) H(jenna) H(tanay)
```

A proof for `amy` would include the sibling of `amy` (`jenna`) and then the sibling of that parent (`tanay` side).

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

- `code/merkle.js` — builds a Merkle tree from hashed emails and checks whether an input email is on the whitelist
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
