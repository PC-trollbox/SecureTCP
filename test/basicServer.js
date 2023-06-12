const server = require("../fulltcp");
const fs = require("fs");
const secopts = {
    publicKey: fs.readFileSync("public.pem"),
    privateKey: fs.readFileSync("private.pem")
};

let actual_server = server.createServer(secopts);
actual_server.listen(3000);
actual_server.events.on("connect", function(socket) {
    socket.socketEE.emit("snd-data", "It works!");
    socket.destroy();
})