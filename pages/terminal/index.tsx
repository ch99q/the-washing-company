import React, { useState } from "react";

import Head from "next/head";

import Layout from "layouts/default";
import { RecaptchaVerifier, useAuth } from "hooks/use-auth";
import { useRouter } from "next/router";

/*
 * Screen process, of the check-in to the car wash.
 * 1. Choose a service.
 * 2. Login or Register using phone number.
 *  2.1 Enter password
 *  2.2 Confirm correct details.
 * 3. Order summery.
 * 4. Payment.
 * 5. Process monitor.
 */

function ChooseService({ setScreen, setProduct }) {
  return (
    <main className="flex items-center m-auto space-x-8">
      <div
        className="w-64 p-6 transition border-2 border-black cursor-pointer hover:shadow-lg hover:bg-black hover:text-white group"
        onClick={() => {
          setProduct("basic");
          setScreen("auth");
        }}
      >
        <p className="mb-2 text-xl font-bold">Basic</p>
        <p className="text-5xl text-green-500 transition group-hover:text-green-300">
          <span className="mr-2 text-sm">from</span>39.-
        </p>
      </div>
      <div
        className="w-64 p-6 transition border-2 border-black cursor-pointer hover:shadow-lg hover:bg-black hover:text-white group"
        onClick={() => {
          setProduct("premium");
          setScreen("auth");
        }}
      >
        <p className="mb-2 text-xl font-bold">Premium</p>
        <p className="text-5xl text-green-500 transition group-hover:text-green-300">
          <span className="mr-2 text-sm">from</span>49.-
        </p>
      </div>

      <div
        className="w-64 p-6 transition border-2 border-black cursor-pointer hover:shadow-lg hover:bg-black hover:text-white group"
        onClick={() => {
          setProduct("diamond");
          setScreen("auth");
        }}
      >
        <p className="mb-2 text-xl font-bold">Diamond</p>
        <p className="text-5xl text-green-500 transition group-hover:text-green-300">
          <span className="mr-2 text-sm">from</span>69.-
        </p>
      </div>
    </main>
  );
}

function Authentication({ setScreen }) {
  const auth = useAuth();

  if (auth.user) setScreen("order_summery");

  const [showCode, setShowCode] = useState(false);
  const [tlf, setTlf] = useState("");
  const [code, setCode] = useState("");

  const sendCode = React.useCallback(() => {
    auth.phone.authenticate("+45" + tlf).then(() => {
      setShowCode(true);
    });
  }, [tlf]);

  const confirm = React.useCallback(() => {
    auth.phone.confirm(code).then(() => {
      setScreen("order_summery");
    });
  }, [code]);

  return (
    <main className="m-auto">
      {!showCode && (
        <div className="flex flex-col p-6 transition border-2 border-black">
          <div className="p-4 text-xl text-white bg-black">
            <span className="text-gray-200">+45 </span>
            <input
              type="text"
              name="phone"
              id="phone"
              pattern="[0-9]*"
              value={tlf}
              onChange={({ target }) =>
                setTlf(target.value.replaceAll(/[^0-9]/g, ""))
              }
              onKeyDown={({ keyCode }) => {
                keyCode === 13 && sendCode();
              }}
              className="text-white bg-black outline-none focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-1 mt-1">
            {[...new Array(9)].map((_, i) => (
              <div
                className="flex items-center justify-center p-8 text-xl text-white bg-black cursor-pointer select-none"
                key={i}
                onClick={() => {
                  setTlf((tlf) => (tlf += i + 1));
                }}
              >
                {i + 1}
              </div>
            ))}
            <div
              className="flex items-center justify-center p-8 text-xl text-white bg-black cursor-pointer select-none"
              onClick={() => {
                setTlf((tlf) => tlf.substring(0, tlf.length - 1));
              }}
            >
              ⌫
            </div>
            <div
              className="flex items-center justify-center p-8 text-xl text-white bg-black cursor-pointer select-none"
              onClick={() => {
                setTlf((tlf) => (tlf += 0));
              }}
            >
              0
            </div>
            <div
              className="flex items-center justify-center p-8 text-xl text-white bg-black cursor-pointer select-none"
              onClick={sendCode}
            >
              OK
            </div>
          </div>
        </div>
      )}
      {showCode && (
        <div className="flex flex-col p-6 transition border-2 border-black">
          <div className="p-4 text-xl text-white bg-black">
            <input
              type="text"
              name="code"
              id="code"
              pattern="[0-9]*"
              value={code}
              onChange={({ target }) =>
                setCode(target.value.replaceAll(/[^0-9]/g, ""))
              }
              onKeyDown={({ keyCode }) => {
                keyCode === 13 && confirm();
              }}
              className="text-white bg-black outline-none focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-1 mt-1">
            {[...new Array(9)].map((_, i) => (
              <div
                className="flex items-center justify-center p-8 text-xl text-white bg-black cursor-pointer select-none"
                key={i}
                onClick={() => {
                  setCode((code) => (code += i + 1));
                }}
              >
                {i + 1}
              </div>
            ))}
            <div
              className="flex items-center justify-center p-8 text-xl text-white bg-black cursor-pointer select-none"
              onClick={() => {
                setCode((code) => code.substring(0, code.length - 1));
              }}
            >
              ⌫
            </div>
            <div
              className="flex items-center justify-center p-8 text-xl text-white bg-black cursor-pointer select-none"
              onClick={() => {
                setCode((code) => (code += 0));
              }}
            >
              0
            </div>
            <div
              className="flex items-center justify-center p-8 text-xl text-white bg-black cursor-pointer select-none"
              onClick={confirm}
            >
              OK
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function OrderSummery() {
  const auth = useAuth();

  return (
    <main className="m-auto">
      <span>Order summery</span>
      {auth.user && <span>Logged in! {auth.user.phoneNumber}</span>}
    </main>
  );
}

function Monitor() {}

const screens = {
  choose_screen: ChooseService,
  auth: Authentication,
  order_summery: OrderSummery,
  monitor: Monitor,
};

export default function Terminal() {
  const router = useRouter();

  const { id } = router.query;

  const [screen, setScreen] = useState<keyof typeof screens>("choose_screen");
  const [product, setProduct] = useState<"basic" | "premium" | "diamond">();

  const Screen = screens[screen] as any;

  return (
    <Layout>
      <Head>
        <title>The Washing Company</title>
      </Head>

      <RecaptchaVerifier />

      <Screen product={product} setScreen={setScreen} setProduct={setProduct} />
    </Layout>
  );
}
