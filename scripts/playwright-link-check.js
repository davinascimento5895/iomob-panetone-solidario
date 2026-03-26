import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outDir = path.join(__dirname, '..', 'reports');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const baseUrlArg = process.argv[2] || process.env.BASE_URL || 'http://localhost:8081';
const concurrentLimit = parseInt(process.env.CONCURRENCY || '5', 10);

async function collectLinks(page) {
  const anchors = await page.$$eval('a[href]', (nodes) =>
    nodes.map((a) => ({ href: a.href, text: (a.textContent || '').trim(), rel: a.rel || '', target: a.target || '' }))
  );
  const unique = new Map();
  anchors.forEach((a) => { if (a.href) unique.set(a.href, a); });
  return Array.from(unique.values());
}

function isSkippable(href) {
  const lc = (href || '').toLowerCase();
  return lc.startsWith('mailto:') || lc.startsWith('tel:') || lc.startsWith('javascript:') || href === '#' || href.trim() === '';
}

async function checkLink(href, baseUrl, browser, context) {
  const result = { href, status: null, ok: false, reason: null, origin: null, type: 'unknown', consoleErrors: [], pageErrors: [] };
  try {
    const url = new URL(href, baseUrl);
    result.origin = url.origin;
    const sameOrigin = url.origin === new URL(baseUrl).origin;
    result.type = sameOrigin ? 'internal' : 'external';

    // Do a network request first
    try {
      const resp = await context.request.get(url.href);
      result.status = resp.status();
      result.ok = resp.ok();
      if (!result.ok) result.reason = `HTTP ${result.status}`;
    } catch (e) {
      result.ok = false;
      result.reason = String(e);
    }

    // For internal links, also attempt a page navigation to catch runtime errors
    if (sameOrigin) {
      const page = await browser.newPage();
      const consoleMessages = [];
      page.on('console', (msg) => consoleMessages.push({ type: msg.type(), text: msg.text() }));
      const pageErrors = [];
      page.on('pageerror', (err) => pageErrors.push(String(err)));
      try {
        const gotoResp = await page.goto(url.href, { waitUntil: 'domcontentloaded', timeout: 15000 });
        if (gotoResp) {
          const gotoStatus = gotoResp.status();
          if (gotoStatus && gotoStatus >= 400) {
            result.ok = false;
            result.reason = `Navigation HTTP ${gotoStatus}`;
            result.status = gotoStatus;
          }
        }
        await page.waitForTimeout(800);
      } catch (e) {
        pageErrors.push(String(e));
        result.ok = false;
        result.reason = result.reason || String(e);
      } finally {
        result.consoleErrors = consoleMessages.slice(0, 20);
        result.pageErrors = pageErrors.slice(0, 20);
        await page.close();
      }
    }
  } catch (e) {
    result.ok = false;
    result.reason = String(e);
  }
  return result;
}

async function run() {
  const timestamp = Date.now();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  page.setDefaultTimeout(20000);

  console.log(`[link-check] -> Abrindo ${baseUrlArg}`);
  await page.goto(baseUrlArg, { waitUntil: 'networkidle' }).catch((e) => {
    console.error(`[link-check] -> Falha ao abrir ${baseUrlArg}:`, e.message || e);
  });

  const links = await collectLinks(page);
  console.log(`[link-check] -> ${links.length} links encontrados (antes filtro)`);

  const filtered = links.filter(l => l.href && !isSkippable(l.href));
  console.log(`[link-check] -> ${filtered.length} links verificados (excluídos mailto/tel/javascript/#)`);

  const uniq = Array.from(new Map(filtered.map(l => [l.href, l])).values());

  const results = [];
  const queue = [...uniq];
  const workers = Array.from({ length: Math.min(concurrentLimit, queue.length) }).map(async () => {
    while (queue.length) {
      const l = queue.shift();
      try {
        console.log(`[link-check] -> Checando ${l.href}`);
        const res = await checkLink(l.href, baseUrlArg, browser, context);
        results.push(res);
      } catch (e) {
        results.push({ href: l.href, ok: false, reason: String(e) });
      }
    }
  });

  await Promise.all(workers);
  await browser.close();

  const broken = results.filter(r => !r.ok);
  const out = { baseUrl: baseUrlArg, timestamp, total: results.length, brokenCount: broken.length, results };
  const outPath = path.join(outDir, `link-check-${timestamp}.json`);
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf-8');
  console.log(`[link-check] -> Relatório salvo em ${outPath}`);
  if (broken.length) {
    console.log('[link-check] -> Links quebrados encontrados:');
    broken.forEach(b => console.log(` - ${b.href} -> ${b.reason || b.status}`));
    process.exit(2);
  } else {
    console.log('[link-check] -> Nenhum link quebrado detectado.');
    process.exit(0);
  }
}

run().catch(err => { console.error(err); process.exit(1); });
