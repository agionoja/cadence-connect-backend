import { Server } from "socket.io";

const socketIo = async (httpServer) => {
  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    console.log(socket);
  });
};

export default socketIo;
