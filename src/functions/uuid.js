const chars = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789`;

let countMaster = 0;
export default () => {
  let str = '';
  let count = 20;
  while (count--) str += chars[Math.floor(Math.random() * chars.length)];
  return countMaster++ + '';
};
