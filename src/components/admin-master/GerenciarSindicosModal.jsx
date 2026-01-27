import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  X, 
  Search, 
  Crown, 
  UserPlus, 
  Trash2,
  AlertTriangle,
  Loader2
} from "lucide-react";

export default function GerenciarSindicosModal({ condominio, onClose, onUpdate }) {
  const [adminsCondominio, setAdminsCondominio] = useState([]);
  const [usuariosDisponiveis, setUsuariosDisponiveis] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Buscar admins já vinculados ao condomínio
      const { data: rolesCondominio, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .eq('condominio_id', condominio.id)
        .eq('role', 'admin');
      
      if (rolesError) throw rolesError;
      
      // Buscar perfis dos admins
      if (rolesCondominio && rolesCondominio.length > 0) {
        const userIds = rolesCondominio.map(r => r.user_id);
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, nome, telefone')
          .in('user_id', userIds);
        
        if (profilesError) throw profilesError;
        
        // Combinar com dados de auth para pegar email
        const adminsComDados = rolesCondominio.map(role => {
          const profile = profiles?.find(p => p.user_id === role.user_id) || {};
          return {
            user_id: role.user_id,
            nome: profile.nome || 'Usuário',
            telefone: profile.telefone
          };
        });
        
        setAdminsCondominio(adminsComDados);
      } else {
        setAdminsCondominio([]);
      }
      
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  }, [condominio.id]);

  const searchUsers = async (term) => {
    if (!term || term.length < 2) {
      setUsuariosDisponiveis([]);
      return;
    }
    
    try {
      // Buscar perfis que correspondam à busca
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('user_id, nome, telefone')
        .ilike('nome', `%${term}%`)
        .limit(10);
      
      if (error) throw error;
      
      // Filtrar usuários que já são admins neste condomínio
      const adminIds = adminsCondominio.map(a => a.user_id);
      const disponiveis = (profiles || []).filter(p => !adminIds.includes(p.user_id));
      
      setUsuariosDisponiveis(disponiveis);
    } catch (error) {
      console.error("Erro na busca:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      searchUsers(searchTerm);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchTerm, adminsCondominio]);

  const adicionarSindico = async (usuario) => {
    setSaving(true);
    try {
      // Verificar se já tem role neste condomínio
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', usuario.user_id)
        .eq('condominio_id', condominio.id)
        .maybeSingle();
      
      if (existingRole) {
        // Atualizar role para admin
        await supabase
          .from('user_roles')
          .update({ role: 'admin' })
          .eq('id', existingRole.id);
      } else {
        // Criar nova role
        const { error } = await supabase
          .from('user_roles')
          .insert({
            user_id: usuario.user_id,
            condominio_id: condominio.id,
            role: 'admin'
          });
        
        if (error) throw error;
      }
      
      // Atualizar lista local
      setAdminsCondominio([...adminsCondominio, usuario]);
      setSearchTerm('');
      setUsuariosDisponiveis([]);
      
      if (onUpdate) onUpdate();
      
    } catch (error) {
      console.error("Erro ao adicionar síndico:", error);
      alert("❌ Erro ao adicionar síndico: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const removerSindico = async (userId) => {
    const sindico = adminsCondominio.find(s => s.user_id === userId);
    
    if (!window.confirm(`Tem certeza que deseja remover ${sindico?.nome} como administrador?`)) {
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('condominio_id', condominio.id)
        .eq('role', 'admin');
      
      if (error) throw error;
      
      setAdminsCondominio(adminsCondominio.filter(s => s.user_id !== userId));
      
      if (onUpdate) onUpdate();
      
    } catch (error) {
      console.error("Erro ao remover síndico:", error);
      alert("❌ Erro ao remover síndico: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="w-full max-w-2xl my-8">
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-purple-600" />
            Gerenciar Administradores: {condominio.nome}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
              <span className="ml-2 text-gray-600">Carregando...</span>
            </div>
          ) : (
            <>
              {/* Administradores Atuais */}
              <div>
                <h3 className="font-semibold text-lg mb-4">Administradores do Condomínio</h3>
                
                {adminsCondominio.length === 0 ? (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Nenhum administrador cadastrado para este condomínio.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-3">
                    {adminsCondominio.map(admin => (
                      <div 
                        key={admin.user_id}
                        className="flex items-center justify-between p-4 border rounded-lg bg-white"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                            {admin.nome?.charAt(0) || 'A'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-gray-900">{admin.nome}</p>
                              <Badge className="bg-purple-100 text-purple-800 border-0">
                                Admin
                              </Badge>
                            </div>
                            {admin.telefone && (
                              <p className="text-sm text-gray-600">{admin.telefone}</p>
                            )}
                          </div>
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removerSindico(admin.user_id)}
                          disabled={saving}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Adicionar Novo Admin */}
              <div className="border-t pt-6">
                <h3 className="font-semibold text-lg mb-4">Adicionar Novo Administrador</h3>
                
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Buscar usuário por nome..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {searchTerm.length >= 2 && (
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {usuariosDisponiveis.length === 0 ? (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          Nenhum usuário encontrado com essa busca.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      usuariosDisponiveis.map(usuario => (
                        <div 
                          key={usuario.user_id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                        >
                          <div>
                            <p className="font-medium text-gray-900">{usuario.nome}</p>
                            {usuario.telefone && (
                              <p className="text-sm text-gray-600">{usuario.telefone}</p>
                            )}
                          </div>
                          <Button
                            size="sm"
                            onClick={() => adicionarSindico(usuario)}
                            disabled={saving}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            <UserPlus className="w-4 h-4 mr-1" />
                            Adicionar
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Info */}
              <Alert className="bg-purple-50 border-purple-200">
                <Crown className="h-4 w-4 text-purple-600" />
                <AlertDescription className="text-purple-800 text-sm">
                  <strong>👑 Administradores</strong> podem gerenciar moradores, encomendas, visitantes e todas as funcionalidades do condomínio.
                </AlertDescription>
              </Alert>
            </>
          )}

          <div className="flex justify-end pt-4 border-t">
            <Button onClick={onClose} variant="outline">
              Fechar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
