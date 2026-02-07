import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import LoadingSpinner from './components/LoadingSpinner'

// Lazy load pages for performance
const HomePage = lazy(() => import('./pages/HomePage'))
const DistrictPage = lazy(() => import('./pages/DistrictPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'))
const InitiativesPage = lazy(() => import('./pages/InitiativesPage'))
const MPDashboardPage = lazy(() => import('./pages/MPDashboardPage'))
const MPAnalyticsPage = lazy(() => import('./pages/MPAnalyticsPage'))
const MPComparisonPage = lazy(() => import('./pages/MPComparisonPage'))
const BudgetLandingPage = lazy(() => import('./pages/BudgetLandingPage'))
const BudgetPage = lazy(() => import('./pages/BudgetPage'))
const BudgetComparisonPage = lazy(() => import('./pages/BudgetComparisonPage'))
const PolicyInsightsPage = lazy(() => import('./pages/PolicyInsightsPage'))
const BudgetProjectsPage = lazy(() => import('./pages/BudgetProjectsPage'))
const BudgetHighlightsPage = lazy(() => import('./pages/BudgetHighlightsPage'))
const UnionBudgetAtGlance = lazy(() => import('./pages/UnionBudgetAtGlance'))
const UnionBudgetHighlights = lazy(() => import('./pages/UnionBudgetHighlights'))
const UnionSectorwiseAllocation = lazy(() => import('./pages/UnionSectorwiseAllocation'))
const UnionBudgetComparison = lazy(() => import('./pages/UnionBudgetComparison'))
const MLAFundLandingPage = lazy(() => import('./pages/MLAFundLandingPage'))
const MLADashboardPage = lazy(() => import('./pages/MLADashboardPage'))
const MLAAnalyticsPage = lazy(() => import('./pages/MLAAnalyticsPage'))
const MLAComparisonPage = lazy(() => import('./pages/MLAComparisonPage'))
const MLADistrictComparisonPage = lazy(() => import('./pages/MLADistrictComparisonPage'))
const MLAProjectsPage = lazy(() => import('./pages/MLAProjectsPage'))
import { Analytics } from "@vercel/analytics/react"
import BottomNav from './components/BottomNav'

function App() {
    return (
        <>
            <Suspense fallback={<LoadingSpinner />}>
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
                    <Route path="/union-budget-glance" element={<UnionBudgetAtGlance />} />
                    <Route path="/union-budget-highlights" element={<UnionBudgetHighlights />} />
                    <Route path="/union-sector-allocation" element={<UnionSectorwiseAllocation />} />
                    <Route path="/union-budget-comparison" element={<UnionBudgetComparison />} />
                    <Route path="/mla-fund" element={<MLAFundLandingPage />} />
                    <Route path="/mla-fund-dashboard" element={<MLADashboardPage />} />
                    <Route path="/mla-fund-analytics" element={<MLAAnalyticsPage />} />
                    <Route path="/mla-fund-analytics/:mlaId" element={<MLAAnalyticsPage />} />
                    <Route path="/mla-comparison" element={<MLAComparisonPage />} />
                    <Route path="/district-comparison" element={<MLADistrictComparisonPage />} />
                    <Route path="/mla-projects" element={<MLAProjectsPage />} />
                    <Route path="/mla-projects/:mlaId" element={<MLAProjectsPage />} />
                </Routes>
            </Suspense>
            <BottomNav />
            <Analytics />
        </>
    )
}

export default App



