# Merkle-Proofs-Tutorial

A small JavaScript demo that builds a Merkle tree from a whitelist of emails, then generates and verifies a sibling-path Merkle proof for an input email.

## What the demo does

In `code/merkle.js`:

1. Hash each whitelisted email with SHA-256 (leaves).
2. Build a Merkle tree by pairing hashes and hashing each pair until one root remains (`constructMerkleTree` / levels for sibling lookup).
3. Prompt for an email, hash it, and if it is a leaf: build a Merkle proof (`getProof`), verify it against the root (`verifyProof`), and print the proof steps.

## Merkle proofs

A Merkle proof is the sibling hashes on the path from a leaf to the root. With the root and that path, you can recompute hashes up the tree and check membership without the full leaf list.

With three leaves, `constructMerkleTree` pairs `amy` with `jenna`, then hashes the leftover `tanay` leaf with an empty string (`right = ''`) — it does not duplicate the last hash or carry it up unchanged:

```
                 root
                /    \
     H(amy+jenna)    H(tanay+"")
       /      \            \
   H(amy)  H(jenna)     H(tanay)
```

H(x+y) means SHA-256 of the two child hashes joined together; a leaf H(name) is SHA-256 of the email string.

Proof for `amy`: `[H(jenna) right, H(tanay+"") right]`.

- position `left` → sha256(sibling + current)
- position `right` → sha256(current + sibling)

In this demo the prover and the verifier run in the same process. In real use, the prover holds the whole tree and sends the proof, and the verifier only needs the root and the proof.

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
Merkle proof:
  step 1: sibling=c57bca66444a202b4bf6b8f5918f236c8d61b83535b513c3054c0213e3b39cf1 position=right
  step 2: sibling=2c519959e05deacb48fed51e75a6039bae8c1ee80408316edebc5c784f760bbb position=right
Proof verified against the root
```

For an address not on the list (e.g. `nobody@example.com`):

```
Enter the email address to check: Email address is not whitelisted!
```

![Enter prompt](image/enter.jpg)

## Run the tests

```
npm test
```

```
> Merkle-Proofs-Tutorial@1.0.0 test
> node --test

TAP version 13
# Subtest: Merkle proofs
    # Subtest: every whitelisted email: proof verifies against root
    ok 1 - every whitelisted email: proof verifies against root
    # Subtest: tampered proof (change one sibling) fails
    ok 2 - tampered proof (change one sibling) fails
    # Subtest: wrong leaf hash fails
    ok 3 - wrong leaf hash fails
    # Subtest: email not on list has no proof (no leaf index)
    ok 4 - email not on list has no proof (no leaf index)
    # Subtest: 3-leaf amy proof matches README sketch
    ok 5 - 3-leaf amy proof matches README sketch
    1..5
ok 1 - Merkle proofs
# tests 5
# suites 1
# pass 5
# fail 0
```

## Limitations

- No leaf/node domain separation. A leaf is sha256(email) and an inner node is sha256(left + right), so someone could submit the two child hashes joined together as an "email" and get an inner-node hash. Real implementations prefix leaves and nodes differently.
- Odd leftover nodes are hashed with an empty string (`right = ''`); other libraries may duplicate the last hash instead.
- Whitelist is hardcoded in the source — teaching demo, not production auth.

## Code

- `code/merkle.js` — builds a Merkle tree, generates proofs (`getProof`), and verifies them (`verifyProof`)
- `code/merkle.test.js` — `node --test` coverage for proofs
- `package.json` — `npm start` / `npm test`

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
