import { NextApiRequest, NextApiResponse } from "next";

import useFirebase from "firebase/server";

import status from "utils/status";

export default async function Start(req: NextApiRequest, res: NextApiResponse) {
  return new Promise<void>(async (resolve) => {
    if (!(req.body?.id?.length > 0)) return res.status(500).json(status(400));

    const firebase = useFirebase();

    const id = req?.body?.id as string;
    var client = req?.body?.client as string;

    const document = firebase.firestore().collection("wash").doc(id);

    const snapshot = await document.get();

    if (!snapshot.exists) return resolve(res.status(500).json(status(406)));

    const data = snapshot.data();

    if (!client || client === "") client = data.process?.client;

    if (data.process.status === 1) {
      return resolve(res.status(200).json(status(202)));
    }

    const exceptions = Object.keys(data.status)
      .filter((k) => k !== "code")
      .filter((k) => data.status[k] !== 200)
      .sort((a, b) => data.status[a] - data.status[b]);

    const code = data.status[exceptions[exceptions.length - 1]] || 200;

    if (code !== 200) {
      await document.update({ "status.code": code });

      return resolve(res.status(500).json(status(code)));
    }

    const finish = new Date(new Date().getTime() + 15 * 60000);

    firebase
      .firestore()
      .collection("wash")
      .doc(id)
      .update({
        process: {
          status: 1,
          finish: finish.getTime() - (data.process?.duration || 0),
          client,
        },
      })
      .then(() => {
        resolve(res.status(200).json({ ...status(200), ...req.body }));
      })
      .catch((err) => {
        resolve(res.status(500).json(status(406)));
      });
  });
}
