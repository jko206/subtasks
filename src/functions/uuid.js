const letters = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789`

export const uuid = () => {
  let str = "";
  let count = 20;
  while (count--) str += letters[Math.floor(Math.random() * letters.length)];
  return str;
};