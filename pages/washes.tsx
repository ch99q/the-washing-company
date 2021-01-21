import React, { useState } from "react";

import Link from "next/link";

import Button from "components/elements/button";
import Block from "components/elements/block";

import Layout from "layouts/default";
import useAuthorized from "hooks/use-authorized";
import useSWR, { mutate } from "swr";
import status from "utils/status";

export default function Washes() {
  const auth = useAuthorized();

  const { data: washes, error } = useSWR("/api/washes");

  return (
    <Layout className="flex space-x-8">
      <aside className="w-72">
        <h1 className="text-4xl tracking-wider">Washes</h1>

        <hr className="my-2" />

        <ul>
          <li>
            <a href="#overview">- Overview</a>
          </li>
          <li>
            <a href="#history">- History</a>
          </li>
          <li>
            <a href="#settings">- Settings</a>
          </li>
        </ul>
      </aside>

      <main>
        {washes &&
          washes.map((wash) => (
            <section key={wash.id} id={"wash-" + wash.id} className="mb-6">
              <h1 className="mb-4 text-xl">#{wash.id}</h1>

              <div className="flex flex-wrap">
                <div className="px-6 m-4 border-l-2 border-black min-w-xs">
                  <p>Location</p>
                  <p>
                    {wash.location.street},<br />
                    {wash.location.city},<br />
                    {wash.location.country}
                  </p>
                </div>

                <div className="px-6 m-4 border-l-2 border-black min-w-xs">
                  <p>Process</p>
                  {wash.process.status === 0 && (
                    <p>
                      <span>Status: </span>
                      <span className="text-green-500">Operational</span>
                    </p>
                  )}
                  {wash.process.status === 1 && (
                    <>
                      <p>
                        <span>Status: </span>
                        <span className="text-green-500">Running</span>
                      </p>
                      <p>
                        Finish: {new Date(wash.process.finish).toTimeString()}
                      </p>

                      <p>
                        Client:{" "}
                        <Link href={"/accounts?user-" + wash.process.client}>
                          <a className="underline">#{wash.process.client}</a>
                        </Link>
                      </p>
                    </>
                  )}
                  {wash.process.status === 2 && (
                    <p>
                      <span>Status: </span>
                      <span className="text-red-500">Aborted</span>
                    </p>
                  )}
                </div>

                <div className="max-w-md px-6 m-4 border-l-2 border-black min-w-xs">
                  <p>Status</p>
                  {"status" in status(wash.status.code) && (
                    <p className="text-green-500">
                      {status(wash.status.code).status.message}
                    </p>
                  )}
                  {"error" in status(wash.status.code) && (
                    <p className="text-red-500">
                      {status(wash.status.code).error.message}
                    </p>
                  )}
                </div>

                {"error" in status(wash.status.code) && (
                  <div className="px-6 m-4 border-l-2 border-black min-w-xs">
                    <p>Exceptions</p>
                    {Object.keys(wash.status)
                      .filter(
                        (key) =>
                          key !== "code" && "error" in status(wash.status[key])
                      )
                      .map((key) => (
                        <p>
                          <span className="font-bold">{key}</span>{" "}
                          {wash.status[key]}
                        </p>
                      ))}
                  </div>
                )}

                <div className="px-6 m-4 border-l-2 border-black min-w-xs">
                  <p className="mb-2">Wash Controls</p>
                  {wash.process.status !== 1 ? (
                    <Button
                      onClick={() =>
                        fetch("/api/wash/start", {
                          method: "POST",
                          body: JSON.stringify({
                            id: wash.id,
                            token: auth.user.token,
                          }),
                          headers: {
                            "Content-Type": "application/json",
                          },
                        }).then(() => {
                          mutate("/api/washes");
                        })
                      }
                      className="my-auto"
                    >
                      Start
                    </Button>
                  ) : (
                    <Button
                      onClick={() =>
                        fetch("/api/wash/abort", {
                          method: "POST",
                          body: JSON.stringify({
                            id: wash.id,
                            token: auth.user.token,
                          }),
                          headers: {
                            "Content-Type": "application/json",
                          },
                        }).then(() => {
                          mutate("/api/washes");
                        })
                      }
                      className="my-auto"
                    >
                      Abort
                    </Button>
                  )}
                </div>
              </div>
            </section>
          ))}
      </main>
    </Layout>
  );
}
