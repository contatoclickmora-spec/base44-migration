import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

// Pages that should render without the Layout (public pages)
const PUBLIC_PAGES = ['Auth', 'inicio', 'PoliticaPrivacidade', 'pagina'];

const LayoutWrapper = ({ children, currentPageName }) => {
  // Skip Layout for public pages
  if (PUBLIC_PAGES.includes(currentPageName)) {
    return <>{children}</>;
  }
  return Layout ? <Layout currentPageName={currentPageName}>{children}</Layout> : <>{children}</>;
};

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Render the routes - public pages render immediately, protected pages wait for auth
  return (
    <Routes>
      {/* Public pages - render immediately without auth check */}
      {PUBLIC_PAGES.map(path => {
        const Page = Pages[path];
        if (!Page) return null;
        return (
          <Route
            key={path}
            path={`/${path}`}
            element={<Page />}
          />
        );
      })}
      
      {/* Main page if public */}
      {PUBLIC_PAGES.includes(mainPageKey) && (
        <Route path="/" element={<MainPage />} />
      )}
      
      {/* Protected pages - require auth */}
      {(!isLoadingPublicSettings && !isLoadingAuth) ? (
        <>
          {!PUBLIC_PAGES.includes(mainPageKey) && (
            <Route path="/" element={
              <LayoutWrapper currentPageName={mainPageKey}>
                <MainPage />
              </LayoutWrapper>
            } />
          )}
          {Object.entries(Pages)
            .filter(([path]) => !PUBLIC_PAGES.includes(path))
            .map(([path, Page]) => (
              <Route
                key={path}
                path={`/${path}`}
                element={
                  <LayoutWrapper currentPageName={path}>
                    <Page />
                  </LayoutWrapper>
                }
              />
            ))}
        </>
      ) : (
        <Route path="*" element={
          <div className="fixed inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
          </div>
        } />
      )}
      
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
