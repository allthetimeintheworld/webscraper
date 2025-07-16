import { Routes, Route } from 'react-router-dom'
import Layout from './components/common/Layout'
import DashboardPage from './pages/Dashboard'
import JobsPage from './pages/Jobs'
import DataPage from './pages/Data'
import InstancesPage from './pages/Instances'
import SettingsPage from './pages/Settings'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/data" element={<DataPage />} />
        <Route path="/instances" element={<InstancesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Layout>
  )
}

export default App
