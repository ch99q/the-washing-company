import { NextApiRequest, NextApiResponse } from "next";

import useFirebase from "firebase/server";

import status from "utils/status";

import { decrypt, encrypt } from "utils/encryption";
import { difference, flatten } from "utils/diff";

export default async function Account(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const firebase = useFirebase();

  const encryptionKey = req.body?.encryption_key;

  const { uid } = await firebase.auth().verifyIdToken(req.body?.token, true);

  if (!uid) {
    return res.status(401).json(status(401));
  }

  if (req.body?.target) {
    // Declare the target uid
    const target: string = req.body?.target || "";

    // Collect all the permissions of user from token.
    const permissions: string[] =
      (await firebase.firestore().collection("users").doc(uid).get()).data()
        ?.permissions || [];

    // Check if user has permission to inspect other users.
    if (!permissions.includes("account.inspect.other"))
      return res.status(401).json(status(401));

    // Declare user and userData for taget user.
    const user = await firebase.auth().getUser(target);
    const userData = await (
      await firebase.firestore().collection("users").doc(target).get()
    )?.data();

    if (req.method === "GET") {
      return res.json({
        id: user.uid,
        account: {
          disabled: user.disabled,
          email: user.email,
          email_verified: user.emailVerified,
          phone_number: user.phoneNumber || "",
        },
        properties: !encryptionKey
          ? userData
          : decrypt(userData, encryptionKey),
      });
    }

    if (req.method === "POST") {
      var modifications = {};

      if (req.body?.account) {
        // Disable the target user.
        if ("disable" in req.body?.account) {
          // Check if user has permission to disable other users.
          if (!permissions.includes("account.disable.other"))
            return res.status(401).json(status(401));

          if (user.disabled !== req.body?.account?.disable) {
            modifications["account.disabled"] = req.body?.account?.disable;
            await firebase.auth().updateUser(target, {
              disabled: req.body?.account?.disable,
            });
          }
        }

        // Change email of the target user.
        if ("email" in req.body?.account) {
          // Check if user has permission to change other users email.
          if (!permissions.includes("account.email.other"))
            return res.status(401).json(status(401));

          if (user.email !== req.body?.account?.email) {
            modifications["account.email"] = req.body?.account?.email;
            await firebase.auth().updateUser(target, {
              email: req.body?.account?.email,
            });
          }
        }

        // Change email verification of the target user.
        if ("emailVerified" in req.body?.account) {
          // Check if user has permission to change other users email verification.
          if (!permissions.includes("account.email.verify.other"))
            return res.status(401).json(status(401));

          if (user.emailVerified !== req.body?.account?.email_verified) {
            modifications["account.email_verified"] =
              req.body?.account?.email_verified;
            await firebase.auth().updateUser(target, {
              emailVerified: req.body?.account?.email_verified,
            });
          }
        }

        // Change email verification of the target user.
        if ("phone_number" in req.body?.account) {
          // Check if user has permission to change other users email verification.
          if (!permissions.includes("account.phone_number.other"))
            return res.status(401).json(status(401));

          if (user.phoneNumber !== req.body?.account?.phone_number) {
            modifications["account.phone_number"] =
              req.body?.account?.phone_number;
            await firebase.auth().updateUser(target, {
              phoneNumber: req.body?.account?.phone_number,
            });
          }
        }
      }

      if ("properties" in req.body) {
        const properties = flatten(difference(req.body?.properties, userData));
        modifications = {
          ...modifications,
          ...properties,
        };

        await firebase
          .firestore()
          .collection("users")
          .doc(target)
          .update(
            !encryptionKey ? properties : encrypt(properties, encryptionKey)
          );
      }

      res.json({
        ...status(200),
        ...modifications,
      });
    }
  }

  return;

  // if ("phoneNumber" in data) {
  //   firebase.auth().updateUser(uid, {
  //     displayName,
  //   });
  // }

  // res.json(uid);

  // if (req.method === "POST") {
  // }

  // if (req.method === "GET") {
  // }
}
