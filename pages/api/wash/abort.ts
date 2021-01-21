import { NextApiRequest, NextApiResponse } from "next";

import useFirebase from "firebase/server";

import status from "utils/status";

export default async function Abort(req: NextApiRequest, res: NextApiResponse) {
  return new Promise<void>(async (resolve) => {
    if (!(req.body?.id?.length > 0))
      return res.status(500).json(status(400));

    const firebase = useFirebase();

    const id = req?.body?.id as string;

    const document = firebase.firestore().collection("wash").doc(id);

    const snapshot = await document.get();

    if (!snapshot.exists) return resolve(res.status(500).json(status(406)));

    const data = snapshot.data();

    const exceptions = Object.keys(data.status)
      .filter((k) => k !== "code")
      .filter((k) => data.status[k] !== 200)
      .sort((a, b) => data.status[a] - data.status[b]);

    const code = data.status[exceptions[exceptions.length - 1]] || 200;

    if (code !== 200) {
      await document.update({ "status.code": code });
    }

    const now = new Date().getTime();

    firebase
      .firestore()
      .collection("wash")
      .doc(id)
      .update({
        ...(code !== 200 ? { "status.code": code } : {}),

        process: {
          status: 2,
          aborted: now,
          duration: data.process.finish - now,
          client: data?.process?.client,
        },
      })
      .then(() => {
        resolve(res.status(200).json({ ...status(200), ...req.body }));
      })
      .catch(() => {
        resolve(res.status(500).json(status(406)));
      });
  });
}
