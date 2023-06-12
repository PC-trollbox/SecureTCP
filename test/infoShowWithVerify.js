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

let keyAuthorities = [
    {
        name: "PCsoft Root Key Authority",
        key: "-----BEGIN PUBLIC KEY-----\n" +
        "MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA4byHLUcAMjYRmuUwrK9F\n" + 
        "eRpSAInhSURYgnJO7uyj0ua5FUFYuv7lT/2Si4hOpUQO2Hie/oO9cEs+OPDKJexu\n" +
        "3MoCEFtFtANwWAF7HkFzWB7UsxpV68G23dnUgq0c/8f3qn6rc49l/OrVrDl2V9ui\n" + 
        "xGjAdNidm20KWGhxJfWZ0sIqatAnDYc9MlcfYr/HzJXBZpKgafX6jU9xTlY4q+He\n" +
        "8JolmDTEpSKqxq5GsZq6WLqzo5SBEqPecZ3qKpX0jny4/toBk7BJxpzzQ0/4Z6Ti\n" +
        "ZJgmyUb7MNY27JdOeAE3jZ0zd3ZmpbVtBmXQJbbAmtX1VS3WibWLbqsoxXlcVQTf\n" +
        "nUjqBrspYisKApdhENbQzTPYV+gjpLrkXb/ijMR1ZlrEocYhmZA4bs5234bJb4/k\n" +
        "DHpUCa+d9o1DsmS9zEWur1nvjQZeMpAVq1zHT8E231uF1BdH+/2BjdYwA9t1vLZT\n" +
        "OIxYYpaDppZANz8DqkQU8qFpcT7b5Soh3y3/aplGbZ8NadeBRmvOTey0VX1s9B17\n" +
        "bOCuHcclhCWZ8eiHF3b0oncOsyO49zQTjDolDdLFvAeD5pGyxp8fbnA6FZtLDtXj\n" +
        "+8Yfxe3i7KO8AjMf4Ryfb7pcrEeOHDcZc4Yr/FdRXGGOv3J73bPqM/HOKFZdYVwy\n" +
        "bhOSSZtL79xVMoSfl37IgyECAwEAAQ==\n" + 
        "-----END PUBLIC KEY-----\n"
    }
]

socket.events.on("connect", function(keys) {
    console.log("Approximate-Key-Length:", findApproximateKeyLength(keys.keyExchange.remote.publicKey.length));
    console.log("Public-Key-Fingerprint:", crypto.createHash("sha256").update(keys.keyExchange.remote.publicKey).digest("base64"));
    console.log("KA-Signatures:", keys.keyExchange.remote.chainOfTrust.join(" -> "));
    console.log("Domain-Name:", keys.keyExchange.remote.domainName);

    console.log("Unsigning key...");
    let appropriateKeyAuthorities = [];
    let cot = keys.keyExchange.remote.rawPublicKey.toString().split(":chainOfTrust:");
    while (cot.length > 1) {
        let toVerify = cot[cot.length - 2];
        let signed = cot[cot.length - 1];
        let lengthBefore = cot.length;
        for (let ka of keyAuthorities) {
            try {
                let unsignedToVerify = crypto.publicDecrypt(ka.key, Buffer.from(signed, "base64"));
                if (unsignedToVerify == crypto.createHash("sha256").update(toVerify).digest("base64")) {
                    cot.shift();
                    appropriateKeyAuthorities.push(ka);
                }
            } catch (e) {
                console.error(e);
            }
        }
        if (cot.length == lengthBefore) {
            console.error("Failed to unsign at stage", lengthBefore);
            process.exit(1);
        }
    }
    console.log("KA-Signed-By:", appropriateKeyAuthorities.map(a => a.name).join(" -> "));
    socket.destroy();
});