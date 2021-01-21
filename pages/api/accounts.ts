import { NextApiRequest, NextApiResponse } from "next";

import useFirebase from "firebase/server";

import status from "utils/status";

export default async function Accounts(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!(req.body?.token?.length > 0)) return res.status(500).json(status(400));

  const firebase = useFirebase();

  const { uid } = await firebase.auth().verifyIdToken(req.body?.token, true);

  if (!uid) {
    return res.status(401).json(status(401));
  }

  // Collect all the permissions.
  const permissions: string[] =
    (await firebase.firestore().collection("users").doc(uid).get()).data()
      ?.permissions || [];

  // Check if user has permission to see other users.
  if (!permissions.includes("account.list.view"))
    return res.status(401).json(status(401));

  const firebaseUsers = await firebase.auth().listUsers();

  var users = [];

  for (const user of firebaseUsers.users) {
    const userData = await (
      await firebase.firestore().collection("users").doc(user.uid).get()
    )?.data();

    users.push({
      id: user.uid,

      account: {
        disabled: user.disabled,
        email: user.email,
        email_verified: user.emailVerified,
        phone_number: user.phoneNumber || "",
      },

      properties: userData,
    });
  }

  res.json(users);
}
