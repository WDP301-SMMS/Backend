export const getPrivateRoom = (senderId: string, receiverId: string): string => {
  return `private-${[senderId, receiverId].sort().join('-')}`;
};
