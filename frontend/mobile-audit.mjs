import { chromium } from "playwright";

const BASE = process.env.BASE || "http://localhost:3999";
const routes = ["/", "/coach", "/dashboard", "/settings", "/urge", "/morning", "/night", "/tasks"];
// iPhone SE / small Android width.
const VIEWPORT = { width: 360, height: 740 };

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 2, isMobile: true });
const page = await ctx.newPage();

let problems = 0;
for (const route of routes) {
  await page.goto(BASE + route, { waitUntil: "networkidle" }).catch(() => {});
  await page.waitForTimeout(400);

  const report = await page.evaluate(() => {
    const docW = document.documentElement.clientWidth;
    const scrollW = document.documentElement.scrollWidth;
    const overflow = scrollW - docW;
    // Find elements wider than the viewport (the actual overflow culprits).
    const wide = [];
    document.querySelectorAll("*").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width > docW + 1 && r.height > 0) {
        wide.push({
          tag: el.tagName.toLowerCase(),
          cls: (el.className && el.className.toString().slice(0, 40)) || "",
          w: Math.round(r.width),
        });
      }
    });
    // Tap targets smaller than 44px (interactive elements only).
    const smallTargets = [];
    document.querySelectorAll("a,button,[role=button],input,textarea,select").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0 && (r.height < 44 || r.width < 44)) {
        smallTargets.push({
          tag: el.tagName.toLowerCase(),
          txt: (el.textContent || "").trim().slice(0, 24),
          h: Math.round(r.height),
          w: Math.round(r.width),
        });
      }
    });
    return { docW, scrollW, overflow, wide: wide.slice(0, 6), smallTargets: smallTargets.slice(0, 8) };
  });

  const ok = report.overflow <= 1;
  if (!ok || report.smallTargets.length > 0) problems++;
  console.log(`\n${route}  ${ok ? "✅ no h-overflow" : "❌ overflow +" + report.overflow + "px"}`);
  if (!ok) console.log("  wide elements:", JSON.stringify(report.wide));
  if (report.smallTargets.length) console.log("  small tap targets:", JSON.stringify(report.smallTargets));
}

console.log(`\n=== ${problems === 0 ? "ALL CLEAN" : problems + " route(s) with issues"} ===`);
await browser.close();
process.exit(0);
