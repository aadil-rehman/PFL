import { createContext, useContext } from 'react'

export const SubmitPanelContext = createContext({
  open: false,
  openPanel: () => {},
  closePanel: () => {},
})

export function useSubmitPanel() {
  return useContext(SubmitPanelContext)
}
