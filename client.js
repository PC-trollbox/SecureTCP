const net = require("net");
const crypto = require("crypto");
const EventEmitter = require("events");

module.exports = function (secopts, ...netopts) {
	let socket = net.createConnection(...netopts);
	let ee = new EventEmitter();
	let remotePublicKey = Buffer.from("");
	socket.on("connect", function () {
		let buf = Buffer.from("");
		socket.on("data", function (data) {
			buf = Buffer.concat([buf, data]);
			if (buf.toString().includes("\0")) {
				let buf2 = buf.toString().split("\0").map(a => Buffer.from(a));
				while (Buffer.compare(Buffer.from(""), buf2[buf2.length - 1]) == 0) buf2.pop();

				for (let buf of buf2) {
					ee.emit("rec-clear-data", buf);
					if (!remotePublicKey.length) {
						remotePublicKey = buf;
						socket.write(secopts.publicKey + "\0");
						socket.socketEE = ee;
						socket.keyExchange = {
							remote: {
								publicKey: remotePublicKey.toString().split(":domainName:")[0],
								domainName: remotePublicKey.toString().split(":domainName:")[1]?.split(":chainOfTrust:")[0],
								chainOfTrust: remotePublicKey.toString().split(":domainName:")[1]?.split(":chainOfTrust:").slice(1),
								rawPublicKey: remotePublicKey
							},
							local: {
								publicKey: secopts.publicKey,
								privateKey: secopts.privateKey
							}
						};
						ee.emit("connect", socket);
					} else {
						try {
							buf = crypto.privateDecrypt(secopts.privateKey, Buffer.from(buf.toString(), "base64"));
						} catch {
							return socket.resetAndDestroy();
						}
						ee.emit("rec-data", buf);
					}
				}
				buf = Buffer.from("");
			}
		});
	});
	ee.on("snd-data", function (buf) {
		buf = buf.toString();
		buf = buf.match(/[\w\W]{1,63}/g);
		try {
			buf = buf.map(a => crypto.publicEncrypt(remotePublicKey.toString().split(":domainName:")[0], Buffer.from(a)).toString("base64"));
		} catch {
			return socket.resetAndDestroy();
		}
		for (let bc of buf) socket.write(bc + "\0");
	});
	socket.events = ee;
	return socket;
};