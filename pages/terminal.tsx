import Head from "next/head";

import { useAuthorized } from "hooks/use-authorized";

import Layout from "../layouts/default";

export default function Terminal() {
  // const loggedIn = useAuthorized();

  // if (!loggedIn) return null;

  return (
    <Layout>
      <Head>
        <title>The Washing Company</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
    </Layout>
  );
}
