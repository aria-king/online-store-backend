// utf8-setup.js
// فعال‌سازی UTF-8 برای خروجی Node.js
try {
  process.stdout.write("\uFEFF"); // اضافه کردن BOM برای UTF-8
  process.env.LANG = "en_US.UTF-8";
  process.env.LC_ALL = "en_US.UTF-8";
  console.log("✅ UTF-8 Encoding Enabled");
} catch (err) {
  console.error("⚠️ UTF-8 setup failed:", err.message);
}
