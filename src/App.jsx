import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import DistrictPage from './pages/DistrictPage'
import AboutPage from './pages/AboutPage'
import ProjectsPage from './pages/ProjectsPage'
import InitiativesPage from './pages/InitiativesPage'
import MPDashboardPage from './pages/MPDashboardPage'
import MPAnalyticsPage from './pages/MPAnalyticsPage'
import MPComparisonPage from './pages/MPComparisonPage'
import BudgetLandingPage from './pages/BudgetLandingPage'
import BudgetPage from './pages/BudgetPage'
import BudgetComparisonPage from './pages/BudgetComparisonPage'
import PolicyInsightsPage from './pages/PolicyInsightsPage'
import BudgetProjectsPage from './pages/BudgetProjectsPage'
import BudgetHighlightsPage from './pages/BudgetHighlightsPage'
import BottomNav from './components/BottomNav'

function App() {
    return (
        <>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/district/:districtId" element={<DistrictPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/initiatives" element={<InitiativesPage />} />
                <Route path="/mp-fund-dashboard" element={<MPDashboardPage />} />
                <Route path="/mp-analytics" element={<MPAnalyticsPage />} />
                <Route path="/mp-comparison" element={<MPComparisonPage />} />
                <Route path="/state-budget" element={<BudgetLandingPage />} />
                <Route path="/budget-details" element={<BudgetPage />} />
                <Route path="/budget-comparison" element={<BudgetComparisonPage />} />
                <Route path="/policy-insights" element={<PolicyInsightsPage />} />
                <Route path="/budget-projects" element={<BudgetProjectsPage />} />
                <Route path="/budget-highlights" element={<BudgetHighlightsPage />} />
            </Routes>
            <BottomNav />
        </>
    )
}

export default App



