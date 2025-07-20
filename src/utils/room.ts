import { Types } from "mongoose";

export const getPrivateRoom = (senderId: Types.ObjectId, receiverId: Types.ObjectId): string => {
  return `private-${[senderId, receiverId].sort().join('-')}`;
};
