const net = require("net");
const crypto = require("crypto");
const EventEmitter = require("events");

module.exports = function (secopts) {
	let ee = new EventEmitter();
	let server = net.createServer((socket) => {
		let remotePublicKey = Buffer.from("");
		let socketEE = new EventEmitter();
		socket.write(secopts.publicKey + "\0");
		let buf = Buffer.from("");
		socket.on("data", function (data) {
			buf = Buffer.concat([buf, data]);
			if (buf.toString().includes("\0")) {
				let buf2 = buf.toString().split("\0").map(a => Buffer.from(a));
				while (Buffer.compare(Buffer.from(""), buf2[buf2.length - 1]) == 0) buf2.pop();

				for (let buf of buf2) {
					socketEE.emit("rec-clear-data", buf);

					if (!remotePublicKey.length) {
						remotePublicKey = buf;
						socket.socketEE = socketEE;
						socket.keyExchange = {
							remote: {
								publicKey: remotePublicKey.toString()
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
						socketEE.emit("rec-data", buf);
					}
				}
				buf = Buffer.from("");
			}
		});
		socketEE.on("snd-data", function (buf) {
			buf = buf.toString();
			buf = buf.match(/[\w\W]{1,63}/g);
			try {
				buf = buf.map(a => crypto.publicEncrypt(remotePublicKey.toString(), Buffer.from(a, "latin1")).toString("base64"));
			} catch {
				return socket.resetAndDestroy();
			}
			for (let bc of buf) socket.write(bc + "\0");
		});
	});
    server.events = ee;
	return server;
};