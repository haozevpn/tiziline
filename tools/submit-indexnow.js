const fs = require("fs");
const path = require("path");

const manifestPath = path.join(__dirname, "..", "indexnow-urls.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

async function submit() {
  const response = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: manifest.host,
      key: manifest.key,
      keyLocation: manifest.keyLocation,
      urlList: manifest.urls,
    }),
  });

  const body = await response.text();
  console.log(`IndexNow ${response.status}: ${body || "accepted"}`);
  if (!response.ok) process.exitCode = 1;
}

submit().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
