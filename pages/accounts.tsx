import React, { useCallback, useEffect, useRef, useState } from "react";

import Link from "next/link";
import Head from "next/head";

import Input from "components/elements/input";
import Block from "components/elements/block";
import Button from "components/elements/button";
import Encrypted from "components/elements/encrypted";

import Layout from "layouts/default";

import useAuthorized from "hooks/use-authorized";

import useSWR from "swr";

import { useAuth } from "hooks/use-auth";

function AccountList({ accounts }: { accounts: any[] }) {
  const auth = useAuth();

  const [keys, setKeys] = useState<{ [key: string]: string }>({
    [auth.user.uid]: auth.user.encryption_key,
  });

  const setKey = (id, key) => {
    setKeys((keys) => {
      return { ...keys, [id]: key };
    });
  };

  const decrypt = (id) => {
    if (keys[id]) return;

    const key = prompt(
      `Please ask client(#${id.slice(0, 8)}...) for encryption key.`
    );

    setKey(id, key);
  };

  return (
    <>
      {accounts.map((user) => (
        <section key={user.id} id={"user-" + user.id} className="mb-6">
          <h1 className="mb-4 text-xl">#{user.id}</h1>

          <div className="flex flex-wrap">
            <div className="px-6 m-4 border-l-2 border-black min-w-xs">
              <p>First name</p>
              <Encrypted
                encryption={keys[user.id]}
                onClick={() => decrypt(user.id)}
              >
                {user?.properties?.profile?.first_name}
              </Encrypted>
            </div>

            <div className="px-6 m-4 border-l-2 border-black min-w-xs">
              <p>Last name</p>
              <Encrypted
                encryption={keys[user.id]}
                onClick={() => decrypt(user.id)}
              >
                {user?.properties?.profile?.last_name}
              </Encrypted>
            </div>

            <div className="px-6 m-4 border-l-2 border-black min-w-xs">
              <p>E-mail address</p>
              <p>{user?.account?.email}</p>
            </div>

            <div className="px-6 m-4 border-l-2 border-black min-w-xs">
              <p>Mobile number</p>
              <p>{user?.account?.phone_number}</p>
            </div>
          </div>
        </section>
      ))}
    </>
  );
}

export default function Accounts() {
  const auth = useAuthorized();

  const [keys, setKeys] = useState<{ [key: string]: string }>({});

  const { data: accounts, error } = useSWR("/api/accounts", {
    fetcher: (url) =>
      fetch(url, {
        method: "POST",
        body: JSON.stringify({
          token: auth.user.token,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }).then((r) => r.json()),
  }) as { data: any[]; error: any };

  if (!auth.user) return null;

  console.log(error);

  return (
    <Layout className="flex space-x-8">
      <Head>
        <title>Accounts | The Washing Company</title>
      </Head>

      <aside className="w-72">
        <h1 className="text-4xl tracking-wider">Accounts</h1>

        <hr className="my-2" />

        <ul>
          <li>
            <p className="font-bold">Accounts</p>
          </li>
          {!accounts && (
            <li>
              <p>- Loading accounts</p>
            </li>
          )}
          {accounts &&
            accounts.map((user) => (
              <li key={user.id} className="whitespace-nowrap">
                <a href={"#user-" + user.id}>- #{user.id.slice(0, 8)}</a>
              </li>
            ))}
        </ul>
      </aside>

      <main>
        {!accounts && (
          <div className="flex flex-col px-6 py-3 border-2 border-black">
            <p>Loading accounts...</p>
          </div>
        )}

        {accounts && <AccountList accounts={accounts} />}
      </main>
    </Layout>
  );
}
