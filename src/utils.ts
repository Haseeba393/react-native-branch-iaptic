export const generateUserID = () => {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let uniqueId = '';
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    uniqueId += characters[randomIndex];
  }
  return uniqueId;
};

export const errorLog = ({
  message,
  error,
}: {
  message: string;
  error: unknown;
}) => {
  console.error(`ERROR OCCURRED ~ `, message, error);
};
