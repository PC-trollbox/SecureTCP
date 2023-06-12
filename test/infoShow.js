const client = require("../fulltcp");
const crypto = require("crypto");
const { findApproximateKeyLength } = require("../akl/akl");
const keyPair = crypto.generateKeyPairSync("rsa", {
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
const socket = client.createConnection(keyPair, 3000, "localhost");

socket.events.on("connect", function(keys) {
    console.log("Approximate-Key-Length:", findApproximateKeyLength(keys.keyExchange.remote.publicKey.length));
    console.log("Public-Key-Fingerprint:", crypto.createHash("sha256").update(keys.keyExchange.remote.publicKey).digest("base64"));
    console.log("KA-Signatures:", keys.keyExchange.remote.chainOfTrust);
    console.log("Domain-Name:", keys.keyExchange.remote.domainName);
    socket.destroy();
});