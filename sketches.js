'use strict';

const mockAsync = function (value) {
  return new Promise((resolve, reject) => {
    if (Math.random() * 20 < 2) {
      reject('Some sort of network error');
    }
    value = 'TRANSFORMED --> ' + value;
    setTimeout(() => {
      resolve(value);
    }, Math.random() * 1000);
  });
};

mockAsync(3)
  .then((res) => console.log(res))
  .catch((err) => console.log(err));
