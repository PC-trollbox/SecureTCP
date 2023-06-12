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
			if (buf[buf.byteLength - 1] == 0) {
				buf = buf.slice(0, buf.byteLength - 1);

				buf.socket = socket;
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
						buf = buf.toString();
						buf = JSON.parse(buf);
						buf = buf.map(a => crypto.privateDecrypt(secopts.privateKey, Buffer.from(a, "base64")).toString("latin1"));
						buf = buf.join("");
						buf = Buffer.from(buf);
					} catch {
						return socket.resetAndDestroy();
					}
					ee.emit("rec-data", buf);
				}
				buf.socket = socket;
				buf = Buffer.from("");
			}
		});
	});
	ee.on("snd-data", function (buf) {
		buf = buf.toString();
		buf = buf.match(/.{1,63}/g);
		try {
			buf = buf.map(a => crypto.publicEncrypt(remotePublicKey.toString().split(":domainName:")[0], Buffer.from(a, "latin1")).toString("base64"));
		} catch {
			return socket.resetAndDestroy();
		}
		buf = JSON.stringify(buf);
		socket.write(buf + "\0");
	});
	socket.events = ee;
	return socket;
};