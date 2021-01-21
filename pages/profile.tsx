import React, { useCallback, useEffect, useRef, useState } from "react";

import Link from "next/link";
import Head from "next/head";

import Block from "components/elements/block";
import Button from "components/elements/button";
import Input from "components/elements/input";

import Layout from "layouts/default";

import { useFirebase } from "hooks/use-firebase";

import {
  RecaptchaVerifier,
  useAuth,
  useRecaptchaVerifier,
} from "hooks/use-auth";
import useAuthorized from "hooks/use-authorized";
import useSWR from "swr";
import { useLocalStorage } from "hooks/use-local-storage";
import Encrypted from "components/elements/encrypted";

export default function Dashboard() {
  const firebase = useFirebase();
  const auth = useAuthorized();

  const [encryption] = useLocalStorage("encryption");

  if (!auth.user) return null;
  if (auth.user) {
    auth.user.getIdToken().then(console.log);
  }

  const firstNameRef = useRef<HTMLInputElement>();
  const lastNameRef = useRef<HTMLInputElement>();
  const emailRef = useRef<HTMLInputElement>();
  const phoneNumberRef = useRef<HTMLInputElement>();

  const updateSettings = useCallback(
    (e) => {
      e.preventDefault();

      const updateFirstName =
        firstNameRef.current.value !== auth.user.profile.first_name &&
        firstNameRef.current.value.length > 0;

      const updateLastName =
        lastNameRef.current.value !== auth.user.profile.last_name &&
        lastNameRef.current.value.length > 0;

      const updateEmail =
        emailRef.current.value !== auth.user.email &&
        emailRef.current.value.length > 0;

      const updatePhone =
        phoneNumberRef.current.value !== auth.user.phoneNumber &&
        phoneNumberRef.current.value.length > 0;

      if (updateFirstName) {
        firebase
          .firestore()
          .collection("users")
          .doc(auth.user.uid)
          .update({ "profile.first_name": firstNameRef.current.value });
      }

      if (updateLastName) {
        firebase
          .firestore()
          .collection("users")
          .doc(auth.user.uid)
          .update({ "profile.last_name": lastNameRef.current.value });
      }

      if (updateEmail) {
        auth.user.updateEmail(emailRef.current.value);
      }

      if (updatePhone) {
        const verifier = useRecaptchaVerifier();
        const provider = new firebase.auth.PhoneAuthProvider();

        provider
          .verifyPhoneNumber(phoneNumberRef.current.value, verifier)
          .then((verificationId) => {
            var verificationCode = window.prompt(
              "Please enter the verification " +
                "code that was sent to your mobile device."
            );
            const phoneCredential = firebase.auth.PhoneAuthProvider.credential(
              verificationId,
              verificationCode
            );

            auth.user.updatePhoneNumber(phoneCredential);
          });
      }
    },
    [firstNameRef, lastNameRef, emailRef, phoneNumberRef]
  );

  return (
    <Layout className="flex space-x-8">
      <Head>
        <title>Profile | The Washing Company</title>
      </Head>

      <Layout.Footer>
        <RecaptchaVerifier />
      </Layout.Footer>

      <aside className="w-72">
        <h1 className="text-4xl tracking-wider">Profile</h1>

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
        <section id="overview" className="pb-32">
          <h1 className="mb-4 text-xl">Overview</h1>

          <div className="flex flex-wrap">
            <div className="px-6 m-4 border-l-2 border-black min-w-xs">
              <p>First name</p>
              <Encrypted encryption={encryption}>
                {auth.user?.profile?.first_name}
              </Encrypted>
            </div>

            <div className="px-6 m-4 border-l-2 border-black min-w-xs">
              <p>Last name</p>
              <Encrypted encryption={encryption}>
                {auth.user?.profile?.last_name}
              </Encrypted>
            </div>

            <div className="px-6 m-4 border-l-2 border-black min-w-xs">
              <p>E-mail address</p>
              <p>{auth.user?.email}</p>
            </div>

            <div className="px-6 m-4 border-l-2 border-black min-w-xs">
              <p>Mobile number</p>
              <p>{auth.user?.phoneNumber}</p>
            </div>
          </div>
        </section>

        <section id="history" className="pb-32">
          <h1 className="mb-4 text-xl">History</h1>

          {auth.user?.history.map((history) => (
            <Block>
              <p>{history.type}</p>
              <p>{new Date(history.timestamp).toUTCString()}</p>
            </Block>
          ))}
        </section>

        <section id="settings" className="pb-32">
          <h1 className="mb-4 text-xl">Settings</h1>

          <form onSubmit={updateSettings}>
            <div className="flex flex-wrap">
              <div className="px-6 m-4 border-l-2 border-black min-w-xs">
                <p>First name</p>
                <Input
                  ref={firstNameRef}
                  type="text"
                  name="first_name"
                  id="first_name"
                  defaultValue={auth.user?.profile.first_name}
                />
              </div>

              <div className="px-6 m-4 border-l-2 border-black min-w-xs">
                <p>Last name</p>
                <Input
                  ref={lastNameRef}
                  type="text"
                  name="last_name"
                  id="last_name"
                  defaultValue={auth.user?.profile.last_name}
                />
              </div>

              <div className="px-6 m-4 border-l-2 border-black min-w-xs">
                <p>E-mail address</p>
                <Input
                  ref={emailRef}
                  type="email"
                  name="email"
                  id="email"
                  defaultValue={auth.user?.email}
                  className="w-72"
                />
              </div>

              <div className="px-6 m-4 border-l-2 border-black min-w-xs">
                <p>Mobile number</p>
                <Input
                  ref={phoneNumberRef}
                  type="tlf"
                  name="phone_number"
                  id="phone_number"
                  defaultValue={auth.user?.phoneNumber}
                />
              </div>
            </div>

            <Button type="submit">Update details</Button>
          </form>
        </section>
      </main>
    </Layout>
  );
}
