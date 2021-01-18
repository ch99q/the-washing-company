import React from "react";

import "styles/tailwind.base.css";
import "styles/tailwind.components.css";

import "styles/globals.css";

import "styles/tailwind.utilities.css";

import { ProvideFirebase } from "../hooks/use-firebase";
import { ProvideAuth } from "hooks/use-auth";

function MyApp({ Component, pageProps }) {
  return (
    <ProvideFirebase
      config={{
        apiKey: "AIzaSyCdB2aZqlmjLgulPaoN1dXk_UOo3QOAdgk",
        authDomain: "the-washing-company.firebaseapp.com",
        projectId: "the-washing-company",
        storageBucket: "the-washing-company.appspot.com",
        messagingSenderId: "394926479544",
        appId: "1:394926479544:web:34e928c01570f55e5b3c4d",
        measurementId: "G-JJW42Y84PK",
      }}
      auth
    >
      <ProvideAuth>
        <Component {...pageProps} />
      </ProvideAuth>
    </ProvideFirebase>
  );
}

export default MyApp;
