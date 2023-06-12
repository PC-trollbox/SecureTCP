const crypto = require("crypto");

console.warn("[akl]", "Please switch to a static akl.");

let table = {};
while (kl != 4224) {
    let keypair = crypto.generateKeyPairSync("rsa", {
        modulusLength: kl,
        publicKeyEncoding: {
            type: "spki",
            format: "pem"
        },
        privateKeyEncoding: {
            type: "pkcs8",
            format: "pem"
        },
    });
    table[keypair.publicKey.length] = kl;
    kl = kl + 128;
}

module.exports = {
    findApproximateKeyLength: (length) => require("./aklfind")(length, table),
    table: table
}