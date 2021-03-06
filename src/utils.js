export function getXYfromPolar(theta, r) {
  return {
    x: 640 + r * Math.cos(theta),
    y: 460 + r * Math.sin(theta),
  };
}

export const getHostId = () => {
  const hrefArray = window.location.href.split('?');
  if (hrefArray.length === 1) return false;
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

export function resetContextTransform(context) {
  context.setTransform(
    context.minScale,
    0,
    0,
    context.minScale,
    context.xOffset,
    0
  );
}
