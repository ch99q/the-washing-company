function makeReactive(obj, key, set) {
  let val = obj[key];

  Object.defineProperty(obj, key, {
    get() {
      return val;
    },
    set(newVal) {
      val = newVal;
      set(key, newVal);
    },
  });
}

// Iterate through our object keys
export function reactify<T>(obj: T, set: (key: string, value: any) => void) {
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      makeReactive(obj, key, set);
    }
  }
}
