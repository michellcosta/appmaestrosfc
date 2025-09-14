// src/pages/api/test-openai.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    ok: true,
    message: "API funcionando 🚀 (Pages Router)",
  });
}
