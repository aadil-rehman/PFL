import HomePage from './pages/HomePage'
import SubmitPanelProvider from './components/submit/SubmitPanelProvider'

export default function App() {
  return (
    <SubmitPanelProvider>
      <HomePage />
    </SubmitPanelProvider>
  )
}
