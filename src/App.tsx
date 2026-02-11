import { RouterProvider } from 'react-router-dom'
import { router } from '@/routes'
import { QueryProvider } from '@/providers/QueryProvider'
import './index.css'

function App() {
  return (
    <QueryProvider>
      <RouterProvider router={router} />
    </QueryProvider>
  )
}

export default App
