import { NextApiRequest, NextApiResponse } from "next";

import status from "utils/status";

import crypto from "crypto";

export default async function Washes(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!(req.body?.token?.length > 0) || req.method !== "POST")
    return res.status(500).json(status(400));

  res.json({
    result: crypto.createHash("md5").update(req.body.token).digest().toString("hex"),
  });
}
