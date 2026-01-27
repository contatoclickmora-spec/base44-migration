import { supabase } from "@/integrations/supabase/client";
import { SessionCache } from "./apiCache";

/**
 * SISTEMA DE AUTENTICAÇÃO E ROLE - SUPABASE
 * Otimizado para carregamento rápido com Supabase Auth
 */

let _cachedUserRole = null;
let _cachedTimestamp = null;
const CACHE_DURATION = 600000; // 10 minutos

// Flag para evitar múltiplas chamadas simultâneas
let _isLoading = false;
let _loadingPromise = null;

/**
 * Obtém o tipo de usuário com cache
 */
export async function getUserRole(forceRefresh = false) {
  try {
    // Se já está carregando, aguardar a promessa existente
    if (_isLoading && _loadingPromise && !forceRefresh) {
      console.log('[AUTH] ⏳ Aguardando carregamento em andamento...');
      return await _loadingPromise;
    }

    // Cache em memória
    const now = Date.now();
    if (!forceRefresh && _cachedUserRole && _cachedTimestamp && (now - _cachedTimestamp < CACHE_DURATION)) {
      console.log('[AUTH] ✅ Usando cache em memória');
      return _cachedUserRole;
    }

    // Cache de sessão (sobrevive a reloads)
    if (!forceRefresh) {
      const sessionCached = SessionCache.get('user_role');
      if (sessionCached) {
        console.log('[AUTH] ✅ Usando cache de sessão');
        _cachedUserRole = sessionCached;
        _cachedTimestamp = now;
        return sessionCached;
      }
    }

    // Iniciar carregamento
    _isLoading = true;
    _loadingPromise = loadUserRoleFromSupabase();

    const result = await _loadingPromise;
    
    // Finalizar carregamento
    _isLoading = false;
    _loadingPromise = null;

    return result;

  } catch (error) {
    console.error("❌ [AUTH] Erro ao obter role:", error);
    _isLoading = false;
    _loadingPromise = null;
    return {
      isAuthenticated: false,
      userType: null,
      error: error.message
    };
  }
}

/**
 * Função auxiliar para carregar role do Supabase
 */
async function loadUserRoleFromSupabase() {
  try {
    console.log('[AUTH] 🔄 Carregando role do Supabase...');

    // Obter sessão atual
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('[AUTH] ❌ Erro ao obter sessão:', sessionError);
      return { 
        isAuthenticated: false, 
        userType: null,
        needsLogin: true,
        error: 'Erro ao verificar sessão'
      };
    }

    if (!session?.user) {
      console.log('[AUTH] 🔐 Usuário não autenticado');
      return { 
        isAuthenticated: false, 
        userType: null,
        needsLogin: true 
      };
    }

    const user = session.user;
    console.log('[AUTH] ✅ Usuário autenticado:', user.email);

    // Buscar roles do usuário
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select(`
        id,
        role,
        condominio_id,
        condominios:condominio_id (
          id,
          nome
        )
      `)
      .eq('user_id', user.id);

    if (rolesError) {
      console.error('[AUTH] ❌ Erro ao buscar roles:', rolesError);
    }

    // Buscar perfil do usuário
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('[AUTH] ⚠️ Erro ao buscar perfil:', profileError);
    }

    // Verificar se é master
    if (userRoles?.some(r => r.role === 'master')) {
      console.log('[AUTH] ✅ Usuário é MASTER');
      const masterRole = userRoles.find(r => r.role === 'master');
      const role = {
        isAuthenticated: true,
        userType: 'admin_master',
        user: {
          id: user.id,
          email: user.email,
          full_name: profile?.nome || user.email,
          role: 'master'
        },
        email: user.email,
        name: profile?.nome || user.email,
        isAdminMaster: true,
        condominioId: masterRole?.condominio_id,
        profile: profile
      };
      cacheRole(role);
      return role;
    }

    // Verificar se é admin
    if (userRoles?.some(r => r.role === 'admin')) {
      console.log('[AUTH] ✅ Usuário é ADMIN');
      const adminRole = userRoles.find(r => r.role === 'admin');
      
      // Buscar dados do morador se existir
      const { data: morador } = await supabase
        .from('moradores')
        .select(`
          *,
          unidades:unidade_id (
            id,
            numero,
            blocos:bloco_id (
              id,
              nome,
              condominio_id
            )
          )
        `)
        .eq('user_id', user.id)
        .maybeSingle();

      const role = {
        isAuthenticated: true,
        userType: 'administrador',
        user: {
          id: user.id,
          email: user.email,
          full_name: profile?.nome || user.email,
          role: 'admin'
        },
        email: user.email,
        name: profile?.nome || user.email,
        isAdminMaster: false,
        condominioId: adminRole?.condominio_id,
        morador: morador ? {
          ...morador,
          condominio_id: morador.unidades?.blocos?.condominio_id || adminRole?.condominio_id,
          nome: profile?.nome
        } : {
          condominio_id: adminRole?.condominio_id,
          nome: profile?.nome
        },
        profile: profile
      };
      cacheRole(role);
      return role;
    }

    // Verificar se é portaria
    if (userRoles?.some(r => r.role === 'portaria')) {
      console.log('[AUTH] ✅ Usuário é PORTARIA');
      const portariaRole = userRoles.find(r => r.role === 'portaria');
      const role = {
        isAuthenticated: true,
        userType: 'porteiro',
        user: {
          id: user.id,
          email: user.email,
          full_name: profile?.nome || user.email,
          role: 'portaria'
        },
        email: user.email,
        name: profile?.nome || user.email,
        isAdminMaster: false,
        condominioId: portariaRole?.condominio_id,
        morador: {
          condominio_id: portariaRole?.condominio_id,
          nome: profile?.nome
        },
        profile: profile
      };
      cacheRole(role);
      return role;
    }

    // Verificar se é morador
    if (userRoles?.some(r => r.role === 'morador')) {
      console.log('[AUTH] ✅ Usuário é MORADOR');
      const moradorRole = userRoles.find(r => r.role === 'morador');
      
      // Buscar dados completos do morador
      const { data: morador } = await supabase
        .from('moradores')
        .select(`
          *,
          unidades:unidade_id (
            id,
            numero,
            blocos:bloco_id (
              id,
              nome,
              condominio_id
            )
          )
        `)
        .eq('user_id', user.id)
        .maybeSingle();

      const role = {
        isAuthenticated: true,
        userType: 'morador',
        user: {
          id: user.id,
          email: user.email,
          full_name: profile?.nome || user.email,
          role: 'morador'
        },
        email: user.email,
        name: profile?.nome || user.email,
        isAdminMaster: false,
        condominioId: morador?.unidades?.blocos?.condominio_id || moradorRole?.condominio_id,
        morador: morador ? {
          ...morador,
          condominio_id: morador.unidades?.blocos?.condominio_id || moradorRole?.condominio_id,
          nome: profile?.nome
        } : null,
        profile: profile
      };
      cacheRole(role);
      return role;
    }

    // Usuário sem role definida
    console.log('[AUTH] ⚠️ Usuário sem role definida');
    return {
      isAuthenticated: true,
      userType: 'sem_role',
      user: {
        id: user.id,
        email: user.email,
        full_name: profile?.nome || user.email
      },
      email: user.email,
      name: profile?.nome || user.email,
      error: 'Usuário não tem permissões configuradas',
      profile: profile
    };

  } catch (error) {
    console.error("❌ [AUTH] Erro crítico ao carregar do Supabase:", error);
    throw error;
  }
}

/**
 * Função auxiliar para salvar role em cache
 */
function cacheRole(role) {
  _cachedUserRole = role;
  _cachedTimestamp = Date.now();
  SessionCache.set('user_role', role, 15); // 15 minutos
  console.log('[AUTH] 💾 Role salva em cache');
}

/**
 * Versão síncrona que retorna cache imediatamente
 */
export function getUserRoleSync() {
  const now = Date.now();
  
  if (_cachedUserRole && _cachedTimestamp && (now - _cachedTimestamp < CACHE_DURATION)) {
    return _cachedUserRole;
  }
  
  // Tentar cache de sessão
  const sessionCached = SessionCache.get('user_role');
  if (sessionCached) {
    _cachedUserRole = sessionCached;
    _cachedTimestamp = now;
    return sessionCached;
  }
  
  return null;
}

/**
 * Pré-carregar role em background
 */
export async function preloadUserRole() {
  try {
    await getUserRole(true);
  } catch (error) {
    console.error("Erro ao pré-carregar role:", error);
  }
}

export function getDashboardPath(userType) {
  const dashboardMap = {
    'admin_master': '/AdminMaster',
    'administrador': '/Dashboard',
    'porteiro': '/Dashboard',
    'morador': '/DashboardMorador'
  };

  return dashboardMap[userType] || '/DashboardMorador';
}

export function canAccessDashboard(userType, dashboardType) {
  if (userType === 'admin_master') return true;

  const permissions = {
    'morador': ['morador'],
    'porteiro': ['porteiro', 'morador'],
    'administrador': ['administrador', 'porteiro', 'morador']
  };

  return permissions[userType]?.includes(dashboardType) || false;
}

export function clearAuthCache() {
  _cachedUserRole = null;
  _cachedTimestamp = null;
  _isLoading = false;
  _loadingPromise = null;
  SessionCache.remove('user_role');
  console.log('[AUTH] 🧹 Cache de autenticação limpo');
}