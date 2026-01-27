import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Auth from '@/pages/Auth';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

// Pages that don't require authentication
const PUBLIC_PAGES = ['Auth', 'inicio', 'PoliticaPrivacidade'];

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin, isAuthenticated } = useAuth();

  // Render the app with routes - Auth page is always accessible
  return (
    <Routes>
      {/* Public Auth route - always accessible */}
      <Route path="/Auth" element={<Auth />} />
      
      {/* Public pages */}
      {PUBLIC_PAGES.filter(p => p !== 'Auth').map(pageName => {
        const Page = Pages[pageName];
        if (!Page) return null;
        return (
          <Route
            key={pageName}
            path={`/${pageName}`}
            element={
              <LayoutWrapper currentPageName={pageName}>
                <Page />
              </LayoutWrapper>
            }
          />
        );
      })}
      
      {/* Main route */}
      <Route path="/" element={
        isLoadingAuth ? (
          <div className="fixed inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
          </div>
        ) : !isAuthenticated ? (
          <Auth />
        ) : (
          <LayoutWrapper currentPageName={mainPageKey}>
            <MainPage />
          </LayoutWrapper>
        )
      } />
      
      {/* Protected pages */}
      {Object.entries(Pages)
        .filter(([path]) => !PUBLIC_PAGES.includes(path))
        .map(([path, Page]) => (
          <Route
            key={path}
            path={`/${path}`}
            element={
              isLoadingAuth ? (
                <div className="fixed inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
                </div>
              ) : !isAuthenticated ? (
                <Auth />
              ) : authError?.type === 'user_not_registered' ? (
                <UserNotRegisteredError />
              ) : (
                <LayoutWrapper currentPageName={path}>
                  <Page />
                </LayoutWrapper>
              )
            }
          />
        ))}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <NavigationTracker />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
