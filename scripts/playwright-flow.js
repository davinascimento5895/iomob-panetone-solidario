import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';
import { inspect } from 'util';

async function run() {
  const timestamp = Date.now();
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const outDir = path.join(__dirname, '..', 'screenshots');
  const desktopDir = path.join(outDir, 'desktop');
  const mobileDir = path.join(outDir, 'mobile');
  [outDir, desktopDir, mobileDir].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

  const browser = await chromium.launch({ headless: true });

  // DESKTOP FLOW
  const context = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  const page = await context.newPage();
  page.setDefaultTimeout(20000);

  // Inject performance observers early to capture LCP/FCP/CLS
  await page.addInitScript(() => {
    try {
      // collect LCP
      (function () {
        const perf = (window.__perf = window.__perf || {});
        try {
          const po = new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
              if (entry.entryType === 'largest-contentful-paint') {
                perf.lcp = Math.max(perf.lcp || 0, entry.startTime || 0);
              }
            }
          });
          po.observe({ type: 'largest-contentful-paint', buffered: true });
        } catch (e) {
          // ignore
        }

        // capture CLS
        try {
          let cls = 0;
          const po2 = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!entry.hadRecentInput) cls += entry.value || 0;
            }
            perf.cls = cls;
          });
          po2.observe({ type: 'layout-shift', buffered: true });
        } catch (e) {}

        // On load capture navigation and paint timings
        window.addEventListener('load', () => {
          try {
            const nav = performance.getEntriesByType('navigation')[0];
            const paints = performance.getEntriesByType('paint');
            perf.navigation = nav ? {
              domInteractive: nav.domInteractive,
              domContentLoaded: nav.domContentLoadedEventEnd,
              loadEventEnd: nav.loadEventEnd,
              ttfb: nav.responseStart - nav.requestStart
            } : {};
            perf.paints = {};
            for (const p of paints) perf.paints[p.name] = p.startTime;
            // ensure LCP is present (some browsers report buffered entries)
            const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
            if (lcpEntries && lcpEntries.length) {
              perf.lcp = Math.max(perf.lcp || 0, ...lcpEntries.map(e => e.startTime || 0));
            }
          } catch (e) {
            // ignore
          }
        });
      })();
    } catch (e) {
      // ignore
    }
  });

  // First measure the landing page
  console.log('[playwright] -> Abrindo / (landing)');
  await page.goto('http://localhost:8081/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const landingPerf = await page.evaluate(() => window.__perf || {});
  fs.writeFileSync(path.join(desktopDir, `metrics-landing-${timestamp}.json`), JSON.stringify(landingPerf, null, 2));
  console.log('[playwright] -> Landing metrics salvo');

  console.log('[playwright] -> Abrindo /login');
  await page.goto('http://localhost:8081/login', { waitUntil: 'networkidle' });
  // Criar conta (modo sign-up) - try to toggle signup UI if needed
  try {
    // if name field not present, try to toggle sign-up
    const nameExists = await page.locator('#name').count();
    if (!nameExists) {
      const toggle = page.locator('text=Não tem conta? Cadastre-se');
      if ((await toggle.count()) > 0) {
        await toggle.click({ timeout: 3000 }).catch(() => {});
        // wait a bit for UI
        await page.waitForTimeout(400);
      }
    }
  } catch (e) {
    // ignore
  }

  const email = `autotest+${timestamp}@example.com`;
  // Fill fields only if present (UI may be in login-only mode)
  if ((await page.locator('#name').count()) > 0) await page.fill('#name', 'Autotest Playwright');
  if ((await page.locator('#phone').count()) > 0) await page.fill('#phone', '(11) 99999-0000');
  if ((await page.locator('#email').count()) > 0) await page.fill('#email', email);
  if ((await page.locator('#password').count()) > 0) await page.fill('#password', 'SenhaTeste123');

  console.log('[playwright] -> Criando conta e aguardando redirecionamento');
  await Promise.all([
    page.waitForURL('**/app/produtos', { timeout: 20000 }),
    page.locator('button:has-text("Criar Conta")').first().click(),
  ]).catch(() => console.log('[playwright] -> Sem redirecionamento detectado (já logado?)'));

  await page.waitForTimeout(800);
  const ts = `${timestamp}`;
  await page.screenshot({ path: path.join(desktopDir, `produtos-${ts}.png`), fullPage: true });
  console.log('[playwright] -> Screenshot produtos salvo');

  // Adicionar primeiro produto
  const addBtn = page.locator('button:has-text("Adicionar")').first();
  if (await addBtn.count() > 0) {
    await addBtn.scrollIntoViewIfNeeded();
    await addBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(desktopDir, `produtos-adicionado-${ts}.png`), fullPage: true });
    console.log('[playwright] -> Produto adicionado e screenshot gerado');
  }

  // Ir ao carrinho
  await page.goto('http://localhost:8081/app/carrinho', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(desktopDir, `carrinho-${ts}.png`), fullPage: true });
  console.log('[playwright] -> Screenshot carrinho salvo');

  // Finalizar pedido -> checkout
  const finalizar = page.locator('button:has-text("Finalizar Pedido")').first();
  if (await finalizar.count() > 0) {
    await Promise.all([
      page.waitForURL('**/checkout', { timeout: 15000 }),
      finalizar.click()
    ]).catch(() => console.log('[playwright] -> não houve navegação para checkout'));
  }

  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(desktopDir, `checkout-step1-${ts}.png`), fullPage: true });
  console.log('[playwright] -> Screenshot checkout step 1 salvo');

  // Avançar passos do checkout (tenta clicar no botão fixo inferior várias vezes)
  for (let i = 0; i < 3; i++) {
    try {
      await page.evaluate(() => {
        const fixed = document.querySelector('[class*="sticky bottom-0"], [class*="safe-area-bottom"], div[role="dialog"]');
        if (fixed) {
          const btn = Array.from(fixed.querySelectorAll('button')).find(b => b.offsetParent !== null && !b.disabled && (b.innerText || b.textContent || '').trim().length > 0);
          if (btn) { btn.click(); }
        } else {
          const btn = Array.from(document.querySelectorAll('button')).find(b => (b.innerText||'').toLowerCase().includes('continuar') || (b.innerText||'').toLowerCase().includes('confirmar'));
          if (btn && !btn.disabled) btn.click();
        }
      });
    } catch (e) {
      // ignore
    }
    await page.waitForTimeout(900);
    await page.screenshot({ path: path.join(desktopDir, `checkout-step${i + 2}-${ts}.png`), fullPage: true });
    console.log(`[playwright] -> Checkout passo ${i + 2} screenshot salvo`);
  }

  await context.close();

  // MOBILE FLOW
  const mobileContext = await browser.newContext({ viewport: { width: 375, height: 812 }, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15A372 Safari/604.1' });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:8081/app/produtos', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(500);
  await mobilePage.screenshot({ path: path.join(mobileDir, `produtos-${ts}.png`), fullPage: true });
  console.log('[playwright] -> Screenshot mobile produtos salvo');

  // tentar adicionar e ir ao carrinho também no mobile
  const addBtnMobile = mobilePage.locator('button:has-text("Adicionar")').first();
  if (await addBtnMobile.count() > 0) {
    await addBtnMobile.scrollIntoViewIfNeeded();
    await addBtnMobile.click();
    await mobilePage.waitForTimeout(600);
    await mobilePage.screenshot({ path: path.join(mobileDir, `produtos-adicionado-${ts}.png`), fullPage: true });
    console.log('[playwright] -> Produto adicionado mobile e screenshot gerado');
  }

  await mobilePage.goto('http://localhost:8081/app/carrinho', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(500);
  await mobilePage.screenshot({ path: path.join(mobileDir, `carrinho-${ts}.png`), fullPage: true });
  console.log('[playwright] -> Screenshot mobile carrinho salvo');

  await browser.close();
  console.log('[playwright] -> Fluxo concluído. Screenshots em:', outDir);
}

run().catch(err => { console.error(err); process.exit(1); });
