import { isEqual, isPlainObject, reduce } from "lodash";
import flat from "flat";

export function difference(target: object, source: object): object {
  return reduce(
    target,
    function (result, value, key) {
      if (isPlainObject(value)) {
        result[key] = difference(value, source[key]);
      } else if (!isEqual(value, source[key])) {
        result[key] = value;
      }
      return result;
    },
    {}
  );
}

export function flatten(obj: object): object {
  return flat(obj);
}
