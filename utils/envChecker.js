// Create this file as: utils/envChecker.js

const checkEnvironment = () => {
  console.log("\n🔍 Checking Environment Variables...\n");

  const required = [
    "MONGO_URI",
    "JWT_SECRET",
    "PORT",
    "FRONTEND_URL",
  ];

  const optional = [
    "EMAIL_USER",
    "EMAIL_PASS",
    "EMAIL_SERVICE",
    "SMS_API_KEY",
    "NODE_ENV",
  ];

  let allGood = true;

  // Check required vars
  console.log("📋 Required Variables:");
  required.forEach(key => {
    const exists = !!process.env[key];
    const status = exists ? "✅" : "❌";
    console.log(`${status} ${key}: ${exists ? "Set" : "MISSING"}`);
    if (!exists) allGood = false;
  });

  // Check optional vars
  console.log("\n📋 Optional Variables:");
  optional.forEach(key => {
    const exists = !!process.env[key];
    const status = exists ? "✅" : "⚠️";
    console.log(`${status} ${key}: ${exists ? "Set" : "Not set (some features may not work)"}`);
  });

  console.log("\n" + "=".repeat(50));

  if (!allGood) {
    console.error("\n❌ Missing required environment variables!");
    console.error("Please check your .env file or Render environment variables.\n");
    return false;
  }

  console.log("\n✅ All required environment variables are set!\n");
  return true;
};

module.exports = checkEnvironment;