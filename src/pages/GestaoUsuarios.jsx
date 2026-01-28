import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Search,
  Edit,
  Trash2,
  UserPlus,
  Crown,
  Key,
  User as UserIcon,
  Shield,
  Download,
  Mail,
  Phone,
  Building2,
  AlertCircle
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import EditarUsuarioModal from '../components/admin-master/EditarUsuarioModal';
import { useToast } from "@/components/ui/use-toast";

export default function GestaoUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [condominios, setCondominios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipo, setFilterTipo] = useState("todos");
  const [filterCondominio, setFilterCondominio] = useState("todos");
  const [editingUsuario, setEditingUsuario] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Fetch user_roles with profiles and condominios data
      const [rolesResult, moradoresResult, condominiosResult] = await Promise.allSettled([
        supabase
          .from('user_roles')
          .select(`
            id, role, user_id, condominio_id, created_at,
            condominios:condominio_id (id, nome)
          `)
          .order('created_at', { ascending: false }),
        supabase
          .from('moradores')
          .select(`
            id, user_id, status, created_at, is_proprietario,
            unidades:unidade_id (
              id, numero,
              blocos:bloco_id (id, nome, condominio_id)
            )
          `)
          .order('created_at', { ascending: false }),
        supabase
          .from('condominios')
          .select('id, nome')
          .order('nome')
      ]);

      // Process roles data
      const roles = rolesResult.status === 'fulfilled' ? (rolesResult.value.data || []) : [];
      const moradores = moradoresResult.status === 'fulfilled' ? (moradoresResult.value.data || []) : [];
      const condominiosData = condominiosResult.status === 'fulfilled' ? (condominiosResult.value.data || []) : [];
      
      setCondominios(condominiosData);

      // Get all unique user_ids
      const allUserIds = [
        ...new Set([
          ...roles.map(r => r.user_id),
          ...moradores.map(m => m.user_id)
        ])
      ].filter(Boolean);

      // Fetch profiles for all users
      let profilesMap = {};
      if (allUserIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, nome, telefone, cpf, avatar_url')
          .in('user_id', allUserIds);
        
        (profiles || []).forEach(p => {
          profilesMap[p.user_id] = p;
        });
      }

      // Combine all users (from roles and moradores)
      const usuariosMap = new Map();

      // Add users from roles
      roles.forEach(role => {
        const profile = profilesMap[role.user_id] || {};
        const condominio = role.condominios || {};
        
        if (!usuariosMap.has(role.user_id)) {
          usuariosMap.set(role.user_id, {
            id: role.id,
            user_id: role.user_id,
            nome: profile.nome || 'Sem nome',
            telefone: profile.telefone || '',
            cpf: profile.cpf || '',
            avatar_url: profile.avatar_url || '',
            tipo_usuario: mapRoleToTipo(role.role),
            role: role.role,
            status: 'aprovado',
            condominio_id: role.condominio_id,
            condominio_nome: condominio.nome || 'N/A',
            created_at: role.created_at,
            source: 'user_roles'
          });
        } else {
          // User already exists, maybe has multiple roles - update if this is a higher role
          const existing = usuariosMap.get(role.user_id);
          if (getRolePriority(role.role) > getRolePriority(existing.role)) {
            existing.role = role.role;
            existing.tipo_usuario = mapRoleToTipo(role.role);
          }
        }
      });

      // Add moradores that don't have a role in user_roles
      moradores.forEach(m => {
        if (!usuariosMap.has(m.user_id)) {
          const profile = profilesMap[m.user_id] || {};
          const unidade = m.unidades || {};
          const bloco = unidade.blocos || {};
          
          usuariosMap.set(m.user_id, {
            id: m.id,
            user_id: m.user_id,
            nome: profile.nome || 'Sem nome',
            telefone: profile.telefone || '',
            cpf: profile.cpf || '',
            avatar_url: profile.avatar_url || '',
            tipo_usuario: 'morador',
            role: 'morador',
            status: m.status || 'pendente',
            condominio_id: bloco.condominio_id || null,
            condominio_nome: condominiosData.find(c => c.id === bloco.condominio_id)?.nome || 'N/A',
            apelido_endereco: `${bloco.nome || ''} - ${unidade.numero || ''}`.trim(),
            created_at: m.created_at,
            source: 'moradores'
          });
        }
      });

      setUsuarios(Array.from(usuariosMap.values()));
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const mapRoleToTipo = (role) => {
    const map = {
      'master': 'admin_master',
      'admin': 'administrador',
      'portaria': 'porteiro',
      'morador': 'morador'
    };
    return map[role] || role;
  };

  const getRolePriority = (role) => {
    const priorities = { 'master': 4, 'admin': 3, 'portaria': 2, 'morador': 1 };
    return priorities[role] || 0;
  };

  const filteredUsuarios = usuarios.filter(u => {
    const matchSearch = u.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       u.telefone?.includes(searchTerm);
    const matchTipo = filterTipo === "todos" || u.tipo_usuario === filterTipo || u.role === filterTipo;
    const matchCondominio = filterCondominio === "todos" || u.condominio_id === filterCondominio;
    
    return matchSearch && matchTipo && matchCondominio;
  });

  const stats = {
    total: usuarios.length,
    masters: usuarios.filter(u => u.role === 'master').length,
    administradores: usuarios.filter(u => u.role === 'admin').length,
    porteiros: usuarios.filter(u => u.role === 'portaria').length,
    moradores: usuarios.filter(u => u.role === 'morador' || u.tipo_usuario === 'morador').length
  };

  const handleEdit = (usuario) => {
    setEditingUsuario(usuario);
    setShowEditModal(true);
  };

  const handleUpdateUsuario = async () => {
    await loadData();
    setShowEditModal(false);
    setEditingUsuario(null);
  };

  const handleDelete = async (usuario) => {
    if (window.confirm(`Tem certeza que deseja remover ${usuario.nome}?`)) {
      try {
        if (usuario.source === 'user_roles') {
          const { error } = await supabase
            .from('user_roles')
            .delete()
            .eq('id', usuario.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('moradores')
            .delete()
            .eq('id', usuario.id);
          if (error) throw error;
        }
        toast({ title: "Usuário removido com sucesso" });
        loadData();
      } catch (error) {
        console.error("Erro ao remover:", error);
        toast({
          title: "Erro ao remover usuário",
          description: error.message,
          variant: "destructive"
        });
      }
    }
  };

  const exportToCSV = () => {
    const headers = ["Nome", "Telefone", "Tipo", "Role", "Status", "Condomínio"];
    const data = filteredUsuarios.map(u => [
      u.nome,
      u.telefone || "",
      u.tipo_usuario,
      u.role,
      u.status,
      u.condominio_nome || "N/A"
    ]);

    const csv = [
      headers.join(','),
      ...data.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `usuarios_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getTipoBadge = (usuario) => {
    const configs = {
      'master': { color: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white', icon: Crown, label: 'Admin Master' },
      'admin_master': { color: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white', icon: Crown, label: 'Admin Master' },
      'admin': { color: 'bg-purple-100 text-purple-800', icon: Crown, label: 'Síndico' },
      'administrador': { color: 'bg-purple-100 text-purple-800', icon: Crown, label: 'Síndico' },
      'portaria': { color: 'bg-blue-100 text-blue-800', icon: Key, label: 'Porteiro' },
      'porteiro': { color: 'bg-blue-100 text-blue-800', icon: Key, label: 'Porteiro' },
      'morador': { color: 'bg-gray-100 text-gray-800', icon: UserIcon, label: 'Morador' }
    };
    const config = configs[usuario.role] || configs[usuario.tipo_usuario] || configs['morador'];
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} border-0`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">Gestão Global de Usuários</h1>
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                <Crown className="w-3 h-3 mr-1" />
                Admin Master
              </Badge>
            </div>
            <p className="text-gray-600">Controle total sobre todos os usuários da plataforma</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={exportToCSV} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Exportar CSV
            </Button>
            <Button className="gap-2 bg-blue-600">
              <UserPlus className="w-4 h-4" />
              Novo Usuário
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-700 font-medium mb-1">Total</p>
                  <h3 className="text-2xl font-bold text-blue-900">{stats.total}</h3>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-yellow-50 to-orange-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-orange-700 font-medium mb-1">Masters</p>
                  <h3 className="text-2xl font-bold text-orange-900">{stats.masters}</h3>
                </div>
                <Crown className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-purple-700 font-medium mb-1">Síndicos</p>
                  <h3 className="text-2xl font-bold text-purple-900">{stats.administradores}</h3>
                </div>
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-cyan-50 to-cyan-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-cyan-700 font-medium mb-1">Porteiros</p>
                  <h3 className="text-2xl font-bold text-cyan-900">{stats.porteiros}</h3>
                </div>
                <Key className="w-8 h-8 text-cyan-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-gray-50 to-gray-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-700 font-medium mb-1">Moradores</p>
                  <h3 className="text-2xl font-bold text-gray-900">{stats.moradores}</h3>
                </div>
                <UserIcon className="w-8 h-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="mb-6 border-0 shadow-md">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Buscar por nome ou telefone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={filterTipo} onValueChange={setFilterTipo}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de usuário" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os tipos</SelectItem>
                  <SelectItem value="master">Admin Master</SelectItem>
                  <SelectItem value="admin">Síndicos</SelectItem>
                  <SelectItem value="portaria">Porteiros</SelectItem>
                  <SelectItem value="morador">Moradores</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterCondominio} onValueChange={setFilterCondominio}>
                <SelectTrigger>
                  <SelectValue placeholder="Condomínio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os condomínios</SelectItem>
                  {condominios.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Usuários */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Usuários Cadastrados ({filteredUsuarios.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold text-gray-700">Nome</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Contato</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Tipo</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Status</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Condomínio</th>
                    <th className="text-center p-3 font-semibold text-gray-700">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsuarios.map((usuario) => (
                    <tr key={usuario.user_id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {usuario.nome?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{usuario.nome}</p>
                            {usuario.apelido_endereco && (
                              <p className="text-sm text-gray-500">{usuario.apelido_endereco}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="space-y-1">
                          {usuario.telefone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="w-4 h-4" />
                              <span>{usuario.telefone}</span>
                            </div>
                          )}
                          {usuario.cpf && (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span>CPF: {usuario.cpf}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        {getTipoBadge(usuario)}
                      </td>
                      <td className="p-3">
                        <Badge className={`${
                          usuario.status === 'aprovado' ? 'bg-green-100 text-green-800' :
                          usuario.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                          usuario.status === 'rejeitado' ? 'bg-red-100 text-red-800' :
                          usuario.status === 'inativo' ? 'bg-gray-100 text-gray-800' :
                          'bg-gray-100 text-gray-800'
                        } border-0`}>
                          {usuario.status || 'aprovado'}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Building2 className="w-4 h-4" />
                          <span>{usuario.condominio_nome || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex justify-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => handleEdit(usuario)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          {usuario.role !== 'master' && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDelete(usuario)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredUsuarios.length === 0 && (
                <div className="text-center py-12">
                  <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum usuário encontrado com os filtros selecionados</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Card de Permissões */}
        <Card className="mt-6 border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Shield className="w-8 h-8 text-yellow-600 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-yellow-900 mb-2">🔓 Acesso Total de Admin Master</h3>
                <p className="text-sm text-yellow-800">
                  Como Admin Master, você pode visualizar, editar e remover QUALQUER usuário do sistema, 
                  alterar permissões, tipos de acesso e gerenciar todos os dados sem restrições. 
                  Use esse poder com responsabilidade!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modal de Edição */}
        {showEditModal && editingUsuario && (
          <EditarUsuarioModal
            usuario={editingUsuario}
            onClose={() => {
              setShowEditModal(false);
              setEditingUsuario(null);
            }}
            onUpdate={handleUpdateUsuario}
          />
        )}
      </div>
    </div>
  );
}
