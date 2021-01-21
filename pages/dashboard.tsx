import React, { useEffect, useState } from "react";

import Link from "next/link";
import Head from "next/head";

import useSWR from "swr";

import Button from "components/elements/button";

import Layout from "layouts/default";

import useAuthorized from "hooks/use-authorized";

export default function Dashboard() {
  const auth = useAuthorized();

  const { data: washes, error } = useSWR("/api/washes");

  return (
    <Layout className="flex space-x-8">
      <Head>
        <title>Dashboard | The Washing Company</title>
      </Head>

      <aside className="w-72">
        <h1 className="text-4xl tracking-wider">Dashboard</h1>
        <hr className="my-2" />
      </aside>

      <main>
        <section className="flex flex-wrap">
          {!washes && (
            <div className="flex flex-col px-6 py-3 border-2 border-black">
              <p>Loading washes...</p>
            </div>
          )}

          {(washes || []).map((wash) => (
            <div
              className="flex flex-col px-6 py-3 border-2 border-black"
              key={wash.id}
            >
              <p className="font-bold">Wash #{wash.id}</p>
              <p>
                Status:{" "}
                {wash.status.code === -1 && (
                  <span className="text-red-500">Unavailable</span>
                )}
                {wash.status.code === 200 && (
                  <>
                    {wash.process?.status === 1 ? (
                      <span className="text-green-500">Running</span>
                    ) : wash.process?.status === 2 ? (
                      <span className="text-red-500">Aborted</span>
                    ) : (
                      <span className="text-green-500">Operational</span>
                    )}
                  </>
                )}
                {![-1, 200].includes(wash.status.code) && (
                  <span className="text-yellow-500">Exception</span>
                )}
              </p>
              {wash.status.code === 200 && wash.process.status === 1 && (
                <p>Finishing: {new Date(wash.process.finish).toUTCString()}</p>
              )}
              <p>Location: {wash.location?.city}</p>
              <Link href={"/terminal?id=" + wash.id}>
                <a className="mt-2 underline">
                  Inspect Wash
                </a>
              </Link>
            </div>
          ))}
        </section>
      </main>
    </Layout>
  );
}
