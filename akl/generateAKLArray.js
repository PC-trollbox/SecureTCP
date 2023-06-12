const crypto = require("crypto");

let kl = 512;
console.log("{");
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
    console.log("\t" + keypair.publicKey.length + ": " + kl + ",");
    kl = kl + 128;
}
console.log("}");