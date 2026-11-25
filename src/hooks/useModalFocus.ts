import { useLayoutEffect, type RefObject } from 'react'

export function useModalFocus(
  dialogRef: RefObject<HTMLDialogElement | null>,
  initialFocus: RefObject<HTMLElement | null>,
  fallbackId?: string,
) {
  useLayoutEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const opener = document.activeElement
    dialog.showModal()
    initialFocus.current?.focus({ preventScroll: true })
    return () => {
      dialog.close()
      queueMicrotask(() => {
        if (document.querySelector('dialog[open]')) return
        const fallback = fallbackId ? document.getElementById(fallbackId) : null
        const target = opener instanceof HTMLElement && opener !== document.body && opener.isConnected ? opener : fallback
        target?.focus({ preventScroll: true })
      })
    }
  }, [dialogRef, initialFocus, fallbackId])
}
