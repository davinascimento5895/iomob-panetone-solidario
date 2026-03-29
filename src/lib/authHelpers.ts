// Helpers to avoid aggressive auto-redirect after a manual sign-out.
const KEY = "last_manual_signout";

export const markManualSignOut = () => {
  try {
    localStorage.setItem(KEY, String(Date.now()));
  } catch (e) {
    // ignore
  }
};

export const shouldSkipAutoRedirect = (graceMs = 10000) => {
  try {
    const v = localStorage.getItem(KEY);
    if (!v) return false;
    const ts = Number(v);
    if (Number.isNaN(ts)) return false;
    return Date.now() - ts < graceMs;
  } catch (e) {
    return false;
  }
};

export const clearManualSignOut = () => {
  try {
    localStorage.removeItem(KEY);
  } catch (e) {
    // ignore
  }
};

export default { markManualSignOut, shouldSkipAutoRedirect, clearManualSignOut };
