export async function sharePlan(title, text) {
  const url = window.location.origin
  try {
    if (navigator.share) {
      await navigator.share({ title, text, url })
    } else {
      await navigator.clipboard.writeText(text + '\n' + url)
    }
  } catch (e) {
    if (e.name !== 'AbortError') {
      try { await navigator.clipboard.writeText(text + '\n' + url) } catch {}
    }
  }
}
