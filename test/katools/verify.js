const crypto = require("crypto");
const fs = require("fs");
const kapublic = fs.readFileSync(__dirname + "/ka_public.pem");
let to_sign = fs.readFileSync(__dirname + "/public.pem");
to_sign = to_sign.toString();
to_sign = to_sign.split(":chainOfTrust:");
let chunk_to_unsign = to_sign[to_sign.length - 2];
let chunk_with_sign = to_sign[to_sign.length - 1];
let signature = crypto.publicDecrypt(kapublic, Buffer.from(chunk_with_sign, "base64")).toString();
to_sign.splice(to_sign.length - 1, 1)
if (crypto.createHash("sha256").update(chunk_to_unsign).digest("base64") == signature) console.log(to_sign.join(":chainOfTrust:"));
else {
    console.error("Verify failed!");
    console.log(to_sign.join(":chainOfTrust:"));
    process.exit(1);
}