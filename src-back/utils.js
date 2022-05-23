export const sleep = (ms) =>
  new Promise((resolve, _reject) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
