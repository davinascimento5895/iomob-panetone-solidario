import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

(async () => {
  const outDir = path.join(process.cwd(), 'screenshots', 'debug-moderator');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  page.on('console', message => {
    console.log(`[console][${message.type()}] ${message.text()}`);
    if (message.location().url) console.log(`    at ${message.location().url}:${message.location().line}:${message.location().column}`);
  });
  page.on('pageerror', err => console.error('[pageerror]', err));
  page.on('requestfailed', req => console.error(`[requestfailed] ${req.url()} ${req.failure()?.errorText}`));
  page.on('response', async response => {
    if (response.url().includes('/rest/v1/orders') || response.url().includes('/auth/v1')) {
      console.log(`[response] ${response.status()} ${response.url()}`);
      try {
        const ct = response.headers()['content-type'] || '';
        if (ct.includes('application/json')) {
          const body = await response.text();
          console.log(`  body: ${body}`);
        }
      } catch (e) {
        console.error('  response read error', e);
      }
    }
  });

  console.log(' -> Abrindo login');
  await page.goto('http://localhost:8083/login', { waitUntil: 'networkidle' });

  await page.fill('#email', 'developer++@iomob.com.br');
  await page.fill('#password', 'Dev2026!');
  await Promise.all([
    page.waitForNavigation({ url: /.*(\/moderator|\/app\/produtos).*/, waitUntil: 'networkidle', timeout: 20000 }).catch(e => console.warn('no navigation after login', e.message)),
    page.click('button[type=submit]'),
  ]);

  const url = page.url();
  console.log(' -> URL após login', url);

  if (!url.includes('/moderator')) {
    console.log(' -> Forçando navegação para /moderator');
    await page.goto('http://localhost:8083/moderator', { waitUntil: 'networkidle' });
  }

  await page.waitForSelector('#moderatorPickupCode', { timeout: 10000 });
  await page.fill('#moderatorPickupCode', 'AC62EB');

  console.log(' -> Buscando AC62EB');
  await Promise.all([
    page.waitForTimeout(3000),
    page.click('button:has-text("Buscar")')
  ]);

  await page.screenshot({ path: path.join(outDir, 'moderator-search-ac62eb.png'), fullPage: true });

  console.log(' -> Obter conteúdo de resultado');
  const resultado = await page.evaluate(() => {
    const ord = window.document.querySelector('[class*="font-mono"]')?.textContent;
    return { url: window.location.href, pedido: ord, texto: document.body.innerText.slice(0, 4000) };
  });

  fs.writeFileSync(path.join(outDir, 'moderator-search-ac62eb.json'), JSON.stringify(resultado, null, 2));
  console.log(' -> Resultado escrito', resultado);

  await browser.close();
  process.exit(0);
})();