import { NextApiRequest, NextApiResponse } from "next";

import useFirebase from "firebase/server";

function isWashCleared() {
  return new Promise((resolve) => {
    resolve(true);
  });
}

export default async function WashValidate(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return new Promise<void>((resolve) => {
    const firebase = useFirebase();

    const document_id = req.query.id;

    if (typeof document_id === "string" && document_id.length > 0) {
      firebase
        .firestore()
        .collection("washes")
        .doc(document_id)
        .get()
        .then((snapshot) => {
          if (snapshot.exists) {
            const { logs = [], process } = snapshot.data();

            if (process?.status === 2) {
              isWashCleared().then(() => {
                if (
                  logs.filter((log) => log.type === "WASH_READY").length > 0
                ) {
                  firebase
                    .firestore()
                    .collection("washes")
                    .doc(document_id)
                    .update({
                      process: {
                        status: 0,
                      },
                    })
                    .then(() => {
                      res.json({
                        id: "WASH_READY",
                        status: 200,
                      });
                      return resolve();
                    });
                } else {
                  res.status(500).json({
                    id: "WASH_NOT_READY",
                    status: 202,
                  });
                  return resolve();
                }
              });
            }
          } else {
            res.status(500).json({
              id: "INVALID_TERMINAL",
              errorCode: 500,
            });
            return resolve();
          }
        })
        .catch((error) => {
          res.status(500).json({
            id: "DATABASE_EXCEPTION",
            errorCode: 502,
            message: error,
          });
          return resolve();
        });

      res.json({ status: { code: 200 } });
      return resolve();
    }

    res.status(500).json({
      id: "INVALID_TERMINAL",
      errorCode: 500,
    });
    return resolve();
  });
}
