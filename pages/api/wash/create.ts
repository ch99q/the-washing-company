import { NextApiRequest, NextApiResponse } from "next";

import useFirebase from "firebase/server";

import status from "utils/status";

export default async function (req: NextApiRequest, res: NextApiResponse) {
  return new Promise(async (resolve) => {
    // Check if required arguments is valid
    if (
      !(req.body?.location?.street?.length > 0) ||
      !(req.body?.location?.city.length > 0) ||
      !(req.body?.location?.country.length > 0) ||
      req.method !== "POST"
    )
      return res.status(500).json(status(400));

    const firebase = useFirebase();

    const washes = firebase.firestore().collection("wash");

    const exists = await washes
      .where("location.street", "==", req.body.location.street)
      .where("location.city", "==", req.body.location.city)
      .where("location.country", "==", req.body.location.country)
      .get()
      .then((snapshot) => {
        return snapshot.size > 0;
      });

    if (exists) return res.status(500).json(status(405));

    washes
      .add({
        location: req.body.location,
        process: {
          status: 0,
        },
        status: {
          code: 200,
          motor_top: 200,
          motor_left: 200,
          motor_right: 200,
          gate_entry: 200,
          gate_exit: 200,
          water: 200,
          turbine: 200,
          terminal: 200,
        },
      })
      .then((document) => {
        return document.get();
      })
      .then((document) => {
        if (document.exists) {
          const { location, process, status } = document.data();

          return resolve(
            res.json({
              id: document.id,
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
