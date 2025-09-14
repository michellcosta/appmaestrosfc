export default function handler(req, res) {
  const key = process.env.OPENAI_API_KEY || "";
  res.status(200).json({
    ok: true,
    hasKey: Boolean(key),
    keyPrefix: key ? key.slice(0, 7) : null,
    node: process.version,
    env: "vercel-node",
  });
}
