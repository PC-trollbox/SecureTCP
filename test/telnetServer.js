const server = require("../fulltcp");
const fs = require("fs");
const secopts = {
    publicKey: fs.readFileSync("public.pem"),
    privateKey: fs.readFileSync("private.pem")
};

let addon = "";
let actual_server = server.createServer(secopts);
actual_server.listen(3000);
actual_server.events.on("connect", function(socket) {
    socket.socketEE.emit("snd-data", "> ");
    socket.socketEE.on("rec-data", function(data) {
        addon = addon + data.toString();
        socket.socketEE.emit("snd-data", data.toString());
        if (addon.endsWith("\r")) {
            socket.socketEE.emit("snd-data", "\n");
            if (addon == "exit\r") return socket.end();
            socket.socketEE.emit("snd-data", addon + "\n");
            addon = "";
            socket.socketEE.emit("snd-data", "> ");
        }
    });
});