import React, { useEffect, useState } from 'react';
import { getUserRoleSync, getUserRole } from './authUtils';
import { Loader2 } from 'lucide-react';

/**
 * AuthGuard - Protege páginas internas contra acesso não autenticado
 * Redireciona para Auth se usuário não estiver autenticado
 */
export default function AuthGuard({ children }) {
  const [checking, setChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Primeiro tenta cache síncrono
        let roleInfo = getUserRoleSync();
        
        // Se não tem cache, busca assincronamente
        if (!roleInfo) {
          roleInfo = await getUserRole();
        }
        
        if (!roleInfo || !roleInfo.isAuthenticated) {
          // Não autenticado - redirecionar para Auth
          console.log('[AUTH GUARD] Usuário não autenticado, redirecionando para Auth');
          window.location.href = '/Auth';
          return;
        }

        setIsAuthenticated(true);
      } catch (error) {
        console.error('[AUTH GUARD] Erro ao verificar autenticação:', error);
        window.location.href = '/Auth';
      } finally {
        setChecking(false);
      }
    };

    checkAuth();
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Não renderiza nada enquanto redireciona
  }

  return <>{children}</>;
}