import { SessionCache } from "./apiCache";
import { getUserRole } from "./authUtils";

/**
 * SISTEMA MULTI-CONDOMÍNIO - Utilitário Central
 * Usa getUserRole() do authUtils que já funciona corretamente com user_id
 * 
 * Este módulo garante o isolamento completo de dados entre condomínios.
 * NUNCA acesse dados sem usar estas funções.
 */

let _cachedCondominioId = null;
let _cachedUserType = null;
let _cachedUserId = null;

/**
 * Obtém o condomínio do usuário logado usando getUserRole do authUtils
 * Esta é a função PRINCIPAL para identificar o contexto do condomínio
 */
export async function getCondominioContext() {
  try {
    // Verificar cache de sessão primeiro
    const cachedContext = SessionCache.get('condominio_context');
    if (cachedContext && cachedContext.condominioId) {
      _cachedCondominioId = cachedContext.condominioId;
      _cachedUserType = cachedContext.userType;
      _cachedUserId = cachedContext.userId;
      return cachedContext;
    }

    // Usar getUserRole que funciona corretamente com Supabase
    const roleData = await getUserRole();

    if (!roleData) {
      throw new Error("Erro ao obter dados do usuário");
    }

    // Admin Master tem acesso global
    if (roleData.role === 'admin_master' || roleData.role === 'master') {
      const context = {
        userId: roleData.userId,
        userEmail: roleData.email,
        userName: roleData.name,
        userType: 'admin_master',
        condominioId: roleData.condominioId, // pode ser null para master global
        isAdminMaster: true
      };
      
      SessionCache.set('condominio_context', context, 10); // 10 minutos
      _cachedCondominioId = context.condominioId;
      _cachedUserType = context.userType;
      _cachedUserId = context.userId;
      return context;
    }

    // Usuário normal - precisa ter condominioId
    if (!roleData.condominioId) {
      throw new Error("Usuário não está vinculado a nenhum condomínio");
    }

    // Cache do contexto
    _cachedCondominioId = roleData.condominioId;
    _cachedUserType = roleData.role;
    _cachedUserId = roleData.userId;

    const context = {
      userId: roleData.moradorId || roleData.userId,
      userEmail: roleData.email,
      userName: roleData.name,
      userType: roleData.role,
      condominioId: roleData.condominioId,
      moradorStatus: roleData.moradorStatus,
      isAdminMaster: false
    };

    // Salvar em cache de sessão
    SessionCache.set('condominio_context', context, 10); // 10 minutos

    return context;
  } catch (error) {
    console.error('[CONDOMINIO_CONTEXT] Erro:', error);
    throw error;
  }
}

/**
 * Valida se o usuário pertence ao condomínio especificado
 */
export async function validateCondominioAccess(condominioId) {
  const context = await getCondominioContext();
  
  // Admin master tem acesso a tudo
  if (context.isAdminMaster) {
    return true;
  }

  if (context.condominioId !== condominioId) {
    throw new Error("Acesso negado: você não tem permissão para acessar dados deste condomínio");
  }

  return true;
}

/**
 * Filtra lista de entidades pelo condomínio do usuário
 * USO: const filtrados = await filterByCondominio(todosItens)
 */
export async function filterByCondominio(items, condominioField = 'condominio_id') {
  const context = await getCondominioContext();
  
  // Admin master vê tudo
  if (context.isAdminMaster) {
    return items;
  }

  const filtered = items.filter(item => {
    // Se o item tem condominio_id direto
    if (item[condominioField]) {
      return item[condominioField] === context.condominioId;
    }
    return false;
  });
  
  return filtered;
}

/**
 * Adiciona condominio_id aos dados antes de criar
 */
export async function addCondominioId(data) {
  const context = await getCondominioContext();
  
  if (context.isAdminMaster) {
    // Admin master deve especificar o condomínio manualmente
    if (!data.condominio_id) {
      throw new Error("Admin master deve especificar o condominio_id");
    }
    return data;
  }

  return {
    ...data,
    condominio_id: context.condominioId
  };
}

/**
 * Valida operação de update
 */
export async function validateUpdate(itemId, currentItem) {
  const context = await getCondominioContext();
  
  if (context.isAdminMaster) {
    return true;
  }

  if (!currentItem) {
    throw new Error("Item não encontrado");
  }

  if (currentItem.condominio_id !== context.condominioId) {
    throw new Error("Você não tem permissão para modificar este item");
  }

  return true;
}

/**
 * Limpa cache (usar ao fazer logout)
 */
export function clearCondominioCache() {
  _cachedCondominioId = null;
  _cachedUserType = null;
  _cachedUserId = null;
  SessionCache.remove('condominio_context');
}