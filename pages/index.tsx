import { FormEvent, useEffect, useRef, useState } from "react";

import Head from "next/head";

import Layout from "layouts/default";

import Button from "components/elements/button";
import Input from "components/elements/input";

import Block from "components/elements/block";
import { useRouter } from "next/router";

import { useAuth } from "hooks/use-auth";

export default function Home() {
  const { replace } = useRouter();

  const auth = useAuth();

  const [error, setError] = useState();

  const emailRef = useRef<HTMLInputElement>();
  const passwordRef = useRef<HTMLInputElement>();

  if (auth.user) replace("/dashboard");

  const login = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    auth.email
      .login(emailRef.current.value, passwordRef.current.value)
      .then(() => {
        replace("/dashboard");
      })
      .catch((error) => {
        setError(error.message);
      });
  };

  return (
    <Layout>
      <Head>
        <title>The Washing Company</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Block className="m-auto w-112">
        <h1 className="text-xl font-bold text-center">Login</h1>

        {error && (
          <p className="px-3 py-2 mt-4 text-sm text-center bg-red-100">
            {error}
          </p>
        )}

        <form className="flex flex-col mt-8 space-y-4" onSubmit={login}>
          <Input
            ref={emailRef}
            type="email"
            name="email"
            id="email"
            placeholder="olga2020@edu.aarhustech.dk"
            required
          />

          <Input
            ref={passwordRef}
            type="password"
            name="password"
            id="password"
            required
          />

          <Button type="submit">Login</Button>
        </form>
      </Block>
    </Layout>
  );
}
