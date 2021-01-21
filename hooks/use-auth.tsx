import { createContext, useContext, useEffect, useState } from "react";

import { useFirebase } from "./use-firebase";

import type Firebase from "firebase";
import { useRouter } from "next/router";
import { useLocalStorage } from "./use-local-storage";
import { decrypt } from "utils/encryption";

const defaultUser: UserData = {
  profile: {
    first_name: "",
    last_name: "",
  },

  history: [],

  permissions: [],

  token: "",
  encryption_key: "",
};

export interface UserData {
  profile: {
    first_name: string;
    last_name: string;
  };

  history: {
    type: "one-time" | "subscription";
    timestamp: number;
  }[];

  permissions: string[],

  token: string;
  encryption_key: string;
}

export type User = Firebase.User & Readonly<UserData>;

const AuthContext = createContext<{
  user?: User;
  phone: {
    authenticate(phone_number: string): Promise<void>;
    confirm(code: string): Promise<User>;
  };
  email: {
    register(email: string, password: string): Promise<User>;
    login(email: string, password: string): Promise<User>;
  };
  logout(): Promise<void>;
}>(undefined);

export function ProvideAuth({ children }) {
  const { push } = useRouter();

  const firebase = useFirebase();

  const [encryption_key, setKey] = useLocalStorage("encryption");

  const [user, setUser] = useState<Firebase.User>();
  const [data, setData] = useState<UserData>(defaultUser);

  const [
    confirmation,
    setConfirmation,
  ] = useState<Firebase.auth.ConfirmationResult>();
  const [loading, setLoading] = useState(typeof window !== "undefined");

  function createUser(
    user: Firebase.User
  ): Promise<{ user: Firebase.User; data: UserData }> {
    return new Promise(async (resolve) => {
      const document = firebase.firestore().collection("users").doc(user.uid);

      const token = await user.getIdToken();

      document
        .get()
        .then((snapshot) => {
          if (snapshot.exists) {
            return resolve({
              user,
              data: decrypt({
                ...defaultUser,
                ...snapshot.data(),
                token,
                encryption_key,
              }, encryption_key),
            });
          }
          resolve({ user, data: { ...defaultUser, token, encryption_key } });
        })
        .catch(() => {
          resolve({ user, data: { ...defaultUser, token, encryption_key } });
        });
    });
  }

  useEffect(() => {
    var unsubscribeSnapshot;

    const unsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);

        const document = firebase.firestore().collection("users").doc(user.uid);

        const token = await user.getIdToken();

        unsubscribeSnapshot = document.onSnapshot((snapshot) => {
          if (snapshot.exists) {
            setData(decrypt({
              ...defaultUser,
              ...snapshot.data(),
              token,
              encryption_key,
            }, encryption_key));
          }
          setLoading(false);
        });
      } else {
        setUser(undefined);
        setData(undefined);

        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      unsubscribeSnapshot();
    };
  }, []);

  const phone = {
    authenticate(phone_number: string) {
      return new Promise<void>((resolve) => {
        firebase
          .auth()
          .signInWithPhoneNumber(
            phone_number,
            (window as any).recaptchaVerifier
          )
          .then(async (confirmation) => {
            setConfirmation(confirmation);
            setKey(
              (
                await (
                  await fetch("/api/encryption", {
                    method: "POST",
                    body: JSON.stringify({ token: phone_number }),
                    headers: {
                      "Content-Type": "application/json",
                    },
                  })
                ).json()
              ).result
            );

            resolve();
          });
      });
    },
    confirm(code: string) {
      return new Promise<User>((resolve) => {
        confirmation?.confirm(code).then((credentials) => {
          createUser(credentials.user).then(({ user, data }) => {
            // User is valid.
            setUser(user);
            setData(decrypt(data, encryption_key));

            resolve(Object.assign(user, data));
          });
        });
      });
    },
  };

  const email = {
    register(email: string, password: string) {
      return new Promise<User>((resolve) => {
        firebase
          .auth()
          .createUserWithEmailAndPassword(email, password)
          .then((credentials) => {
            createUser(credentials.user).then(async ({ user, data }) => {
              // User is valid.
              setUser(user);
              setData(decrypt(data, encryption_key));
              setKey(
                (
                  await (
                    await fetch("/api/encryption", {
                      method: "POST",
                      body: JSON.stringify({ token: password }),
                      headers: {
                        "Content-Type": "application/json",
                      },
                    })
                  ).json()
                ).result
              );

              resolve(Object.assign(user, data));
            });
          });
      });
    },

    login(email: string, password: string) {
      return new Promise<User>((resolve) => {
        firebase
          .auth()
          .signInWithEmailAndPassword(email, password)
          .then((credentials) => {
            createUser(credentials.user).then(async ({ user, data }) => {
              // User is valid.
              setUser(user);
              setData(decrypt(data, encryption_key));
              setKey(
                (
                  await (
                    await fetch("/api/encryption", {
                      method: "POST",
                      body: JSON.stringify({ token: password }),
                      headers: {
                        "Content-Type": "application/json",
                      },
                    })
                  ).json()
                ).result
              );

              resolve(Object.assign(user, data));
            });
          });
      });
    },
  };

  function logout() {
    return firebase
      .auth()
      .signOut()
      .then(() => {
        push("/");
      });
  }

  if (loading) return null;

  const instance = user ? Object.assign(user, data) : undefined;

  return (
    <AuthContext.Provider
      value={{
        user: instance,
        phone,
        email,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export function RecaptchaVerifier() {
  const firebase = useFirebase();

  useEffect(() => {
    (window as any).recaptchaVerifier = new firebase.auth.RecaptchaVerifier(
      "firebase-recaptcha-verifier",
      {
        size: "invisible",
      }
    );
  }, []);

  return <div id="firebase-recaptcha-verifier" />;
}

export function useRecaptchaVerifier() {
  return (window as any)?.recaptchaVerifier;
}
