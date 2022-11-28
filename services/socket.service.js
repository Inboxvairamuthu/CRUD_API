const socketIo = require("socket.io");

exports.connected;

exports.addSocketIO = function (server) {
    let socketServer = socketIo(server);
    let interval
    socketServer.on("connection", (socket) => {
        console.log("Socket client connected");
        socket.on("disconnect", () => {
            console.log("Socket Client disconnected");
            clearInterval(interval);
        });
    });
}