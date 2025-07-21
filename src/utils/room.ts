export const getPrivateRoom = (senderId: string, receiverId: string): string => {
  return `room-${[senderId, receiverId].sort().join('-')}`;
};
