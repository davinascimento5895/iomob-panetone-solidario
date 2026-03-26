import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

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

  console.log('[playwright] -> Abrindo /login');
  await page.goto('http://localhost:8081/login', { waitUntil: 'networkidle' });

  // Criar conta (modo sign-up)
  try {
    await page.locator('text=Não tem conta? Cadastre-se').click({ timeout: 3000 });
  } catch (e) {
    // já pode estar no modo cadastro
  }
  const email = `autotest+${timestamp}@example.com`;
  await page.fill('#name', 'Autotest Playwright');
  await page.fill('#phone', '(11) 99999-0000');
  await page.fill('#email', email);
  await page.fill('#password', 'SenhaTeste123');

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
