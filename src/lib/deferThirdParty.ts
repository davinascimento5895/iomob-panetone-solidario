// Helpers to defer loading of non-critical scripts and modules until the browser is idle.
export function runWhenIdle(fn: () => void) {
  if (typeof window === "undefined") {
    // server-side no-op
    return;
  }

  const runner = () => {
    try {
      fn();
    } catch (e) {
      // swallow
    }
  };

  if ("requestIdleCallback" in window) {
    (window as any).requestIdleCallback(runner, { timeout: 2000 });
  } else {
    // fallback
    setTimeout(runner, 2000);
  }
}

export function loadScriptWhenIdle(src: string, attrs: Record<string, string> = {}) {
  runWhenIdle(() => {
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    Object.entries(attrs).forEach(([k, v]) => s.setAttribute(k, v));
    document.body.appendChild(s);
  });
}

export default { runWhenIdle, loadScriptWhenIdle };
