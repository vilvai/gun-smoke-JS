export function drawImageCenter(image, x, y, cx, cy, ctx) {
  ctx.setTransform(1, 0, 0, 1, x, y);
  ctx.drawImage(image, -cx, -cy);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

export function getXYfromPolar(theta, r) {
  return {
    x: 640 + r * Math.cos(theta),
    y: 460 + r * Math.sin(theta),
  };
}

export const getHostId = address => {
  const hrefArray = window.location.href.split('?');
  if (hrefArray.length == 1) return false;
  if (!hrefArray[1].includes('host=')) return false;
  return hrefArray[1].split('host=')[1];
};

export const createRandomId = () => {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghiklmnopqrstuvwxyz'.split(
    ''
  );
  let str = '';
  for (let i = 0; i < 16; i++) {
    str += chars[Math.floor(Math.random() * chars.length)];
  }
  return str;
};
