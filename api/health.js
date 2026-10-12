// Endpoint kesehatan (serverless) untuk Vercel.
// Berguna agar deployment Vercel terdeteksi sebagai proyek "Hybrid"
// (Frontend + Serverless Functions) dan terhubung penuh dengan Vercel App,
// serta menyediakan URL /api/health untuk monitoring/uptime check.
export default function handler(req, res) {
  res.status(200).json({
    status: "ok",
    service: "nabung-nikah",
    time: new Date().toISOString(),
  });
}
