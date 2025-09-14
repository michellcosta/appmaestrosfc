export default async function handler(req, res) {
  try {
    const r = await fetch("https://httpbin.org/get");
    const data = await r.json();
    res.status(200).json({ ok: true, data });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
}
