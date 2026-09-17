import { messageSendSocket } from "src/modules/chat/sockets/messageSend.socket";
import { threadJoinSocket } from "src/modules/chat/sockets/threadJoin.socket";
import { threadLeaveSocket } from "src/modules/chat/sockets/threadLeave.socket";

export const chatSocketEvents = [
  threadJoinSocket,
  threadLeaveSocket,
  messageSendSocket,
];
