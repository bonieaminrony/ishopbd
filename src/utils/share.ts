export type ShareResult = 'shared' | 'copied' | 'cancelled' | 'failed';

/**
 * Opens the phone's own share sheet (Messenger, Facebook, WhatsApp, copy link and every
 * other app on the device). Where the browser has no share sheet, the link is copied.
 */
export async function shareLink(data: { title: string; text?: string; url: string }): Promise<ShareResult> {
  const nav: any = typeof navigator !== 'undefined' ? navigator : null;
  if (nav?.share) {
    try {
      await nav.share({ title: data.title, text: data.text ?? data.title, url: data.url });
      return 'shared';
    } catch (err: any) {
      if (err?.name === 'AbortError') return 'cancelled';
      // fall through to copying
    }
  }
  try {
    if (nav?.clipboard?.writeText) {
      await nav.clipboard.writeText(data.url);
      return 'copied';
    }
  } catch {
    /* ignore */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = data.url;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok ? 'copied' : 'failed';
  } catch {
    return 'failed';
  }
}
