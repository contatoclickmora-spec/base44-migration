import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Auth from '@/pages/Auth';
import AguardandoAprovacao from '@/pages/AguardandoAprovacao';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

// Pages that don't require authentication
const PUBLIC_PAGES = ['Auth', 'inicio', 'PoliticaPrivacidade', 'AguardandoAprovacao'];

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

// Loading spinner component
const LoadingSpinner = () => (
  <div className="fixed inset-0 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
  </div>
);

const AuthenticatedApp = () => {
  const { isLoadingAuth, authError, isAuthenticated, isPendingApproval } = useAuth();

  // Render the app with routes - Auth page is always accessible
  return (
    <Routes>
      {/* Public Auth route - always accessible */}
      <Route path="/Auth" element={<Auth />} />
      
      {/* Pending approval route */}
      <Route 
        path="/AguardandoAprovacao" 
        element={
          isLoadingAuth ? (
            <LoadingSpinner />
          ) : !isAuthenticated ? (
            <Navigate to="/Auth" replace />
          ) : (
            <AguardandoAprovacao />
          )
        } 
      />
      
      {/* Public pages */}
      {PUBLIC_PAGES.filter(p => p !== 'Auth' && p !== 'AguardandoAprovacao').map(pageName => {
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
          <LoadingSpinner />
        ) : !isAuthenticated ? (
          <Auth />
        ) : isPendingApproval ? (
          <Navigate to="/AguardandoAprovacao" replace />
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
                <LoadingSpinner />
              ) : !isAuthenticated ? (
                <Auth />
              ) : isPendingApproval ? (
                <Navigate to="/AguardandoAprovacao" replace />
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
