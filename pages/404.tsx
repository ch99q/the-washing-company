import React, { useEffect, useState } from "react";

import Link from "next/link";
import Head from "next/head";

import ErrorPage from "next/error"

import Layout from "layouts/default";

import Button from "components/elements/button";

import { useAuth } from "hooks/use-auth";
import Block from "components/elements/block";

export default function Dashboard() {
  const auth = useAuth();

  return (
    <Layout className="flex space-x-8">
      <Head>
        <title>Profile | The Washing Company</title>
      </Head>

      {auth.user && (
        <Layout.Header>
          <Link href="/dashboard" passHref>
            <Button outline>Dashboard</Button>
          </Link>

          <Link href="/washes" passHref>
            <Button outline>Washes</Button>
          </Link>

          <Link href="/accounts" passHref>
            <Button outline>Accounts</Button>
          </Link>

          <Link href="/profile" passHref>
            <Button outline>Profile</Button>
          </Link>

          <Button onClick={() => auth.logout()} outline>
            Logout
          </Button>
        </Layout.Header>
      )}

      <aside className="w-72">
        <h1 className="text-4xl tracking-wider">Error 404</h1>

        <hr className="my-2" />
      </aside>

      <main className="flex items-center justify-center w-full">
        <Block>This page could not be found.</Block>
      </main>
    </Layout>
  );
}
