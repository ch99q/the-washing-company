import { NextApiRequest, NextApiResponse } from "next";

import useFirebase from "firebase/server";

import status from "utils/status";

export default async function Washes(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return new Promise<void>((resolve) => {
    const firebase = useFirebase();

    firebase
      .firestore()
      .collection("wash")
      .get()
      .then((query) => {
        const washes = [];

        query.forEach((snapshot) => {
          if (snapshot.exists) {
            const { location, process, status } = snapshot.data();

            const exceptions = Object.keys(status)
              .filter((k) => k !== "code")
              .filter((k) => status[k] !== 200)
              .sort((a, b) => status[a] - status[b]);

            const code = status[exceptions[exceptions.length - 1]] || 200;

            if (status.code !== code) {
              status.code = code;

              firebase.firestore().collection("wash").doc(snapshot.id).update({
                "status.code": code,
              });
            }

            washes.push({
              id: snapshot.id,
              location,
              process,
              status,
            });
          }
        });

        return resolve(res.status(200).json(washes));
      })
      .catch((e) => {
        console.log(e);
        return resolve(res.status(406).json(status(406)));
      });
  });
}
