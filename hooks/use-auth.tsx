import { createContext, useContext, useState, useEffect } from "react";
import { useFirebase } from "./use-firebase";

import type Firebase from "firebase";

interface User extends Firebase.User {
  username: string;
  uuid: string;
  accounts: {
    [key: string]: {
      verified: boolean;
      username: string;
    };
  };
}

const AuthContext = createContext<{
  exists: boolean;
  user: User;
  signin: (email: any, password: any) => Promise<User>;
  signup: (email: any, password: any) => Promise<User>;
  signout: () => Promise<void>;
  sendPasswordResetEmail: (email: any) => Promise<boolean>;
  confirmPasswordReset: (code: any, password: any) => Promise<boolean>;
}>({ exists: false } as any);

export function ProvideAuth({ children }) {
  const firebase = useFirebase();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(typeof window !== "undefined");

  const signin = (email, password) => {
    return firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then(({ user }) => {
        if (user) {
          firebase
            .firestore()
            .collection("users")
            .doc(user.uid)
            .onSnapshot((snapshot) => {
              setUser({
                ...user,
                ...(snapshot.exists ? snapshot.data() : {}),
              } as User);
            });
        } else {
          setUser(false);
        }

        return user;
      });
  };

  const signup = (email, password) => {
    return firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then((response) => {
        setUser(response.user);
        return response.user;
      });
  };

  const signout = () => {
    return firebase
      .auth()
      .signOut()
      .then(() => {
        setUser(false);
      });
  };

  const sendPasswordResetEmail = (email) => {
    return firebase
      .auth()
      .sendPasswordResetEmail(email)
      .then(() => {
        return true;
      });
  };

  const confirmPasswordReset = (code, password) => {
    return firebase
      .auth()
      .confirmPasswordReset(code, password)
      .then(() => {
        return true;
      });
  };

  useEffect(() => {
    if (loading) {
      const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          firebase
            .firestore()
            .collection("users")
            .doc(user.uid)
            .onSnapshot((snapshot) => {
              setUser({
                ...user,
                ...(snapshot.exists ? snapshot.data() : {}),
              } as User);
              setLoading(false);
            });
        } else {
          setUser(false);
          setLoading(false);
        }
      });

      return () => unsubscribe();
    }
  }, []);

  if (loading) return null;

  const auth = {
    exists: user,
    user,
    signin,
    signup,
    signout,
    sendPasswordResetEmail,
    confirmPasswordReset,
  };

  return (
    <AuthContext.Provider value={auth as any}>{children}</AuthContext.Provider>
  );
}

// Hook for child components to get the auth object ...
// ... and re-render when it changes.
export const useAuth = () => {
  return useContext(AuthContext);
};
