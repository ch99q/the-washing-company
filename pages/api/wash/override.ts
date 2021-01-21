import { NextApiRequest, NextApiResponse } from "next";

import useFirebase from "firebase/server";

import status from "utils/status";

export default async function Override(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return new Promise<void>(async (resolve) => {
    if (!(req?.query?.id?.length > 0) || !(req?.query?.token?.length > 0))
      return res.status(500).json(status(400));

    const firebase = useFirebase();

    try {
      const user = await firebase
        .auth()
        .verifyIdToken(req.query.token as string);
      if (user.email_verified !== true)
        return resolve(res.status(401).json(status(401)));
    } catch (e) {
      return resolve(res.status(401).json(status(401)));
    }

    const id = req?.query?.id as string;

    const document = firebase.firestore().collection("wash").doc(id);

    document
      .update(req.body)
      .then(async () => {
        const snapshot = await firebase
          .firestore()
          .collection("wash")
          .doc(id)
          .get();

        if (!snapshot.exists) return resolve(res.status(500).json(status(406)));

        const data = snapshot.data();

        const exceptions = Object.keys(data.status)
          .filter((k) => k !== "code")
          .filter((k) => data.status[k] !== 200)
          .sort((a, b) => data.status[a] - data.status[b]);

        const code = data.status[exceptions[exceptions.length - 1]] || 200;

        await document.update({
          "status.code": code,
        });

        resolve(
          res.status(200).json({
            ...status(200),
            ...req.body,
            ...{
              "status.code": code,
            },
          })
        );
      })
      .catch(() => {
        resolve(res.status(500).json(status(406)));
      });
  });
}
