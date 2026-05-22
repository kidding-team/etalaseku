import * as React from 'react'

// Hook return { requestClose, ConfirmDialog } yang dibungkus AlertDialog di komponen pemanggil.
// Implementasi minimal di hook ini hanya menyediakan state machine; UI dialog
// dirender oleh konsumen (PanelDetailKonten) untuk menjaga komposisi shadcn.
export function useUnsavedChangesGuard(isDirty: boolean) {
  const [pendingClose, setPendingClose] = React.useState(false)

  const requestClose = React.useCallback(
    (proceed: () => void) => {
      if (isDirty) {
        setPendingClose(true)
        // simpan callback proceed untuk dipanggil saat user konfirmasi "Buang"
        proceedRef.current = proceed
      } else {
        proceed()
      }
    },
    [isDirty],
  )

  const proceedRef = React.useRef<(() => void) | null>(null)

  const confirm = React.useCallback(() => {
    setPendingClose(false)
    const fn = proceedRef.current
    proceedRef.current = null
    fn?.()
  }, [])

  const cancel = React.useCallback(() => {
    setPendingClose(false)
    proceedRef.current = null
  }, [])

  return { pendingClose, requestClose, confirm, cancel }
}
