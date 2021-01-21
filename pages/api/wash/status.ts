import { NextApiRequest, NextApiResponse } from "next";

import useFirebase from "firebase/server";

import status from "utils/status";

export default async function Status(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return new Promise<void>((resolve) => {
    if (!(req.query.id.length > 0)) return res.status(500).json(status(400));

    const firebase = useFirebase();

    const id = req?.query?.id as string;

    const document = firebase.firestore().collection("wash").doc(id);

    document
      .get()
      .then(async (snapshot) => {
        if (snapshot.exists) {
          const { location, process, status } = snapshot.data();

          const exceptions = Object.keys(status)
            .filter((k) => k !== "code")
            .filter((k) => status[k] !== 200)
            .sort((a, b) => status[a] - status[b]);

          const code = status[exceptions[exceptions.length - 1]] || 200;

          if (status.code !== code) {
            status.code = code;

            await document.update({
              "status.code": code,
            });
          }

          return resolve(
            res.json({
              id: snapshot.id,
              location,
              process,
              status,
            })
          );
        }

        resolve(res.status(500).json(status(404)));
      })
      .catch(() => {
        resolve(res.status(500).json(status(406)));
      });
  });
}
