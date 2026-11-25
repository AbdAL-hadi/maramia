import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../../context/LanguageContext'

export function useWorkspaceCopy() {
  const [result, setResult] = useState<{ copied: boolean; value: string; attempt: number } | null>(null)
  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value)
      setResult((previous) => ({ copied: true, value, attempt: (previous?.attempt ?? 0) + 1 }))
    } catch {
      setResult((previous) => ({ copied: false, value, attempt: (previous?.attempt ?? 0) + 1 }))
    }
  }
  return { copy, result, clearCopy: () => setResult(null) }
}

export function WorkspaceCopyResult({ result }: { result: ReturnType<typeof useWorkspaceCopy>['result'] }) {
  const { t } = useLanguage()
  const field = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    if (result && !result.copied) {
      field.current?.focus()
      field.current?.select()
    }
  }, [result])
  if (!result) return null
  return <div className="workspace-copy-result" key={result.attempt}>
    <p role="status">{t(result.copied ? 'workspaceCopied' : 'workspaceCopyFallback')}</p>
    {!result.copied && <label className="order-field">{t('workspaceCopyText')}
      <textarea ref={field} value={result.value} dir="auto" rows={3} readOnly
        onFocus={() => field.current?.select()} />
    </label>}
  </div>
}
