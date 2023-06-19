const client = require("../fulltcp");
const crypto = require("crypto");
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

socket.events.on("rec-data", function(data) {
    process.stdout.write(data.toString());
});

process.stdin.setRawMode(true);
process.stdin.on("data", function(data) {
    socket.events.emit("snd-data", data.toString());
});

socket.on("close", () => process.exit());