import Crypto from "crypto-js";

export type Hash = {
  iv: string;
  content: string;
};

export function encrypt(obj: any, encryptionKey: string): any {
  if (Array.isArray(obj)) return encryptArray(obj as [], encryptionKey);

  if (typeof obj === "object") return encryptObject(obj, encryptionKey);

  if (typeof obj !== "string") return obj;

  const salt = encryptionKey;

  const encrypted = Crypto.AES.encrypt(obj, salt);

  return `enc:${encrypted}` as any;
}

export function encryptArray<T extends []>(arr: T, encryptionKey: string): T {
  var encryptedArray = [];
  for (let i = 0; i < arr.length; i++) {
    encryptedArray[i] = encrypt(arr[i], encryptionKey);
  }
  return encryptedArray as any;
}

export function encryptObject<T extends {}>(obj: T, encryptionKey: string): T {
  var encryptedObject = {} as any;
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      encryptedObject[key] = encrypt(obj[key], encryptionKey);
    }
  }
  return encryptedObject as T;
}

export function decrypt(obj: any, encryptionKey: string): any {
  if (Array.isArray(obj)) return decryptArray(obj as [], encryptionKey);

  if (typeof obj === "object") return decryptObject(obj, encryptionKey);

  if (typeof obj !== "string") return obj;

  if (!obj.startsWith("enc:")) return obj;

  const encrypted = obj.split(":")[1];

  const salt = encryptionKey;

  return Crypto.AES.decrypt(encrypted, salt).toString(Crypto.enc.Utf8);
}

export function decryptArray<T extends []>(arr: T, encryptionKey: string): T {
  var encryptedArray = [];
  for (let i = 0; i < arr.length; i++) {
    encryptedArray[i] = decrypt(arr[i], encryptionKey);
  }
  return encryptedArray as any;
}

export function decryptObject<T extends {}>(obj: T, encryptionKey: string): T {
  var decryptedObject = {} as any;
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      decryptedObject[key] = decrypt(obj[key], encryptionKey);
    }
  }
  return decryptedObject as T;
}
