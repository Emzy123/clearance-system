const baseUrl = process.env.SMOKE_BASE_URL || "http://localhost:5000/api";

async function expectOk(response, label) {
  if (!response.ok) {
    throw new Error(`${label} failed with ${response.status}`);
  }
}

async function run() {
  console.log(`Running smoke checks against ${baseUrl}`);

  const health = await fetch(`${baseUrl}/health`);
  await expectOk(health, "Health check");
  const healthJson = await health.json();
  if (!healthJson?.success) {
    throw new Error("Health payload missing success=true");
  }

  const demoEmail = process.env.SMOKE_EMAIL;
  const demoPassword = process.env.SMOKE_PASSWORD;
  if (demoEmail && demoPassword) {
    const login = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: demoEmail, password: demoPassword })
    });
    await expectOk(login, "Login smoke check");
  } else {
    console.log("Skipping login smoke check (set SMOKE_EMAIL and SMOKE_PASSWORD to enable)");
  }

  console.log("Smoke checks passed.");
}

run().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
