export function rand(round = 16) {
  let str = '';
  for (let i = 0; i < round; i++) {
    str += Math.random().toString().slice(2);
  }
  return str;
}
