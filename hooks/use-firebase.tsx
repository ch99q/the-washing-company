import { createContext, useContext, useEffect, useState } from "react";

import type Firebase from "firebase";

const FirebaseContext = createContext<typeof Firebase | undefined>(undefined);

type FirebaseConfig = {
  analytics?: boolean;
  firestore?: boolean;
  database?: boolean;
  auth?: boolean;
};

export function ProvideFirebase({
  children,
  config,
  analytics = false,
  firestore = false,
  database = false,
  auth = false,
}: React.PropsWithChildren<
  FirebaseConfig & {
    config: {
      appId: string;
      apiKey: string;
      projectId: string;
      authDomain: string;
      storageBucket: string;
      databaseURL?: string;
      measurementId?: string;
      messagingSenderId?: string;
    };
  }
>) {
  const [firebase, setFirebase] = useState<typeof Firebase>();

  const importFirebase = async () => {
    const { default: firebase } = await import("firebase/app");

    await Promise.all([
      analytics && import("firebase/analytics"),
      auth && import("firebase/auth"),
      firestore && import("firebase/firestore"),
      database && import("firebase/database"),
    ]);

    if (!firebase.apps.length) {
      firebase.initializeApp(config);

      if (auth)
        firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);

      if (firestore) firebase.firestore();

      if (database) firebase.database();

      if (analytics) firebase.analytics();

      setFirebase(firebase);
    }
  };

  useEffect(() => {
    importFirebase();
  }, []);

  if (typeof window !== "undefined" && !firebase) return null;

  return (
    <FirebaseContext.Provider value={firebase}>
      {children}
    </FirebaseContext.Provider>
  );
}

export function useFirebase(): typeof Firebase {
  return useContext(FirebaseContext);
}
