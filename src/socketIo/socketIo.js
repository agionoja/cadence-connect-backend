import { Server } from "socket.io";

const socketIo = (httpServer) => {
  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    console.log(socket);
  });
};

export default socketIo;
