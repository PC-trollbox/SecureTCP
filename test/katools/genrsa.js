const crypto = require("crypto");
const fs = require("fs");
const { findApproximateKeyLength } = require("../../akl/akl");

const keypair = crypto.generateKeyPairSync("rsa", {
    modulusLength: 4096,
    publicKeyEncoding: {
        type: "spki",
        format: "pem"
    },
    privateKeyEncoding: {
        type: "pkcs8",
        format: "pem"
    },
});

fs.writeFileSync("ka_private.pem", keypair.privateKey);
fs.writeFileSync("ka_public.pem", keypair.publicKey);

console.log("Approximate-Key-Length:", findApproximateKeyLength(keypair.publicKey.length));
console.log("Public-Key-Fingerprint:", crypto.createHash("sha256").update(keypair.publicKey).digest("base64"));
console.log("KA-Signatures: none");
console.log("Domain-Name: none");
console.log("");
console.log("/* This is a \"KA\" KEY, FOR SIGNING OTHER KEYS ONLY! **");
console.log("**        Do not run servers with this key!         **");
console.log("**     Running servers with this key can kause      **");
console.log("**                security issues.                  */");