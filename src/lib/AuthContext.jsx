import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getUserRole, clearAuthCache } from '@/components/utils/authUtils';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings, setAppPublicSettings] = useState({});
  const [userStatus, setUserStatus] = useState(null); // 'pendente', 'aprovado', 'rejeitado', 'inativo', 'no_role'
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    checkAppState();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          clearAuthCache();
          setUser(null);
          setIsAuthenticated(false);
          setUserStatus(null);
          setUserRole(null);
          setIsLoadingAuth(false);
          return;
        }
        
        if (session?.user) {
          setUser(session.user);
          setIsAuthenticated(true);
          // Check user status and role after auth
          await checkUserStatus(session.user.id);
        } else {
          setUser(null);
          setIsAuthenticated(false);
          setUserStatus(null);
          setUserRole(null);
        }
        setIsLoadingAuth(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkUserStatus = async (userId) => {
    try {
      console.log('[AUTH_CONTEXT] Verificando status do usuário:', userId);
      
      // First check if user has any role in user_roles table (master, admin, portaria)
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('id, role, condominio_id')
        .eq('user_id', userId);
      
      if (rolesError) {
        console.error('[AUTH_CONTEXT] Error checking user roles:', rolesError);
      }

      // If user has ANY role in user_roles, they're approved
      if (roles && roles.length > 0) {
        console.log('[AUTH_CONTEXT] Usuário tem role em user_roles:', roles[0].role);
        setUserStatus('aprovado');
        setUserRole(roles[0].role);
        return;
      }

      // Check if user is a morador
      const { data: morador, error: moradorError } = await supabase
        .from('moradores')
        .select('id, status, unidade_id')
        .eq('user_id', userId)
        .maybeSingle();

      if (moradorError) {
        console.error('[AUTH_CONTEXT] Error checking morador status:', moradorError);
      }

      if (morador) {
        console.log('[AUTH_CONTEXT] Usuário é morador com status:', morador.status);
        // User is a morador, check their status
        const moradorStatus = morador.status || 'pendente';
        setUserStatus(moradorStatus);
        if (moradorStatus === 'aprovado') {
          setUserRole('morador');
        }
      } else {
        console.log('[AUTH_CONTEXT] Usuário não tem role nem é morador - pendente');
        // User has no role and is not a morador = new user pending
        setUserStatus('pendente');
      }
    } catch (error) {
      console.error('[AUTH_CONTEXT] Error checking user status:', error);
      setUserStatus('pendente');
    }
  };

  const checkAppState = async () => {
    try {
      console.log('[AUTH_CONTEXT] Iniciando checkAppState...');
      setIsLoadingAuth(true);
      setAuthError(null);
      
      // Check current session with timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Session check timeout')), 10000)
      );
      
      const sessionPromise = supabase.auth.getSession();
      
      let sessionResult;
      try {
        sessionResult = await Promise.race([sessionPromise, timeoutPromise]);
      } catch (timeoutError) {
        console.error('[AUTH_CONTEXT] Timeout ao verificar sessão');
        setIsLoadingAuth(false);
        setIsAuthenticated(false);
        return;
      }
      
      const { data: { session }, error } = sessionResult;
      
      if (error) {
        console.error('[AUTH_CONTEXT] Session check failed:', error);
        setAuthError({
          type: 'unknown',
          message: error.message
        });
        setIsLoadingAuth(false);
        return;
      }

      if (session?.user) {
        console.log('[AUTH_CONTEXT] Usuário encontrado na sessão:', session.user.email);
        setUser(session.user);
        setIsAuthenticated(true);
        await checkUserStatus(session.user.id);
      } else {
        console.log('[AUTH_CONTEXT] Nenhuma sessão ativa');
        setIsAuthenticated(false);
        setUserStatus(null);
      }
      
      console.log('[AUTH_CONTEXT] checkAppState concluído');
      setIsLoadingAuth(false);
    } catch (error) {
      console.error('[AUTH_CONTEXT] Unexpected error:', error);
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

  // isPendingApproval is true ONLY for users without an admin role AND with pendente status
  // Users with master, admin, or portaria roles are never pending
  const isAdminRole = ['master', 'admin', 'portaria'].includes(userRole);
  const isPendingApproval = userStatus === 'pendente' && !isAdminRole;

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      userStatus,
      userRole,
      isAdminRole,
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
