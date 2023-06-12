const crypto = require("crypto");
const fs = require("fs");
const { findApproximateKeyLength } = require("../akl/akl");
const readline = require("readline");
const rl = readline.createInterface(process.stdin, process.stdout);

const keypair = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: {
        type: "spki",
        format: "pem"
    },
    privateKeyEncoding: {
        type: "pkcs8",
        format: "pem"
    },
});

console.log("Approximate-Key-Length:", findApproximateKeyLength(keypair.publicKey.length));
console.log("Public-Key-Fingerprint:", crypto.createHash("sha256").update(keypair.publicKey).digest("base64"));
console.log("KA-Signatures: none");

rl.question("Domain-Name: ", function(dn) {
    rl.close();
    fs.writeFileSync("private.pem", keypair.privateKey);
    fs.writeFileSync("public.pem", keypair.publicKey + ":domainName:" + dn);
});