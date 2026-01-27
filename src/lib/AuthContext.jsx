import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings, setAppPublicSettings] = useState({});
  const [userStatus, setUserStatus] = useState(null); // 'pendente', 'aprovado', 'rejeitado', 'inativo', 'no_role'

  useEffect(() => {
    checkAppState();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          setIsAuthenticated(true);
          // Check user status after auth
          await checkUserStatus(session.user.id);
        } else {
          setUser(null);
          setIsAuthenticated(false);
          setUserStatus(null);
        }
        setIsLoadingAuth(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkUserStatus = async (userId) => {
    try {
      // First check if user has any role (master, admin, portaria)
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('id, role, condominio_id')
        .eq('user_id', userId);
      
      if (rolesError) {
        console.error('Error checking user roles:', rolesError);
      }

      // If user has roles, they're approved (admin/master/portaria)
      if (roles && roles.length > 0) {
        setUserStatus('aprovado');
        return;
      }

      // Check if user is a morador
      const { data: morador, error: moradorError } = await supabase
        .from('moradores')
        .select('id, status, unidade_id')
        .eq('user_id', userId)
        .maybeSingle();

      if (moradorError) {
        console.error('Error checking morador status:', moradorError);
      }

      if (morador) {
        // User is a morador, check their status
        setUserStatus(morador.status || 'pendente');
      } else {
        // User has no role and is not a morador = new user pending
        setUserStatus('pendente');
      }
    } catch (error) {
      console.error('Error checking user status:', error);
      setUserStatus('pendente');
    }
  };

  const checkAppState = async () => {
    try {
      setIsLoadingAuth(true);
      setAuthError(null);
      
      // Check current session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session check failed:', error);
        setAuthError({
          type: 'unknown',
          message: error.message
        });
        setIsLoadingAuth(false);
        return;
      }

      if (session?.user) {
        setUser(session.user);
        setIsAuthenticated(true);
        await checkUserStatus(session.user.id);
      } else {
        setIsAuthenticated(false);
        setUserStatus(null);
      }
      
      setIsLoadingAuth(false);
    } catch (error) {
      console.error('Unexpected error:', error);
      setAuthError({
        type: 'unknown',
        message: error.message || 'An unexpected error occurred'
      });
      setIsLoadingAuth(false);
    }
  };

  const logout = async (shouldRedirect = true) => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setIsAuthenticated(false);
      setUserStatus(null);
      
      if (shouldRedirect) {
        window.location.href = '/Auth';
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navigateToLogin = () => {
    window.location.href = '/Auth';
  };

  const isPendingApproval = userStatus === 'pendente';

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      userStatus,
      isPendingApproval,
      logout,
      navigateToLogin,
      checkAppState,
      checkUserStatus
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
