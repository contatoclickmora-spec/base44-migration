import React, { useState, useEffect } from "react";
import { Condominio } from "@/entities/Condominio";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserCheck, CheckCircle, XCircle, Clock, AlertTriangle, User as UserIcon, Home, Hash, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AprovarMoradorModal from "../components/aprovacao/AprovarMoradorModal";
import { logAction } from "../components/utils/logger";
import { supabase } from "@/integrations/supabase/client";

export default function AprovacaoMoradoresPage() {
  const [moradoresPendentes, setMoradoresPendentes] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [moradorSelecionado, setMoradorSelecionado] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [userCondominioId, setUserCondominioId] = useState(null);
  const [condominioAtual, setCondominioAtual] = useState(null);

  useEffect(() => {
    const abortController = new AbortController();
    loadData();
    return () => abortController.abort();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError("Usuário não autenticado");
        setLoading(false);
        return;
      }
      
      // Get user's role and condominio from user_roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role, condominio_id')
        .eq('user_id', user.id);
      
      if (rolesError || !userRoles || userRoles.length === 0) {
        setError("Erro: Usuário não possui permissões configuradas.");
        setLoading(false);
        return;
      }
      
      // Find admin role (síndico)
      const adminRole = userRoles.find(r => r.role === 'admin' || r.role === 'master');
      
      if (!adminRole) {
        setError("Erro: Você não tem permissão para aprovar moradores.");
        setLoading(false);
        return;
      }
      
      const condominioId = adminRole.condominio_id;
      setUserCondominioId(condominioId);

      // Load condominium data
      const { data: condominio } = await supabase
        .from('condominios')
        .select('*')
        .eq('id', condominioId)
        .single();
      
      setCondominioAtual(condominio);
      
      // Load pending moradores for this condominium
      const { data: moradores, error: moradoresError } = await supabase
        .from('moradores')
        .select(`
          *,
          profiles:user_id (nome, telefone, avatar_url),
          unidades:unidade_id (numero, bloco_id)
        `)
        .eq('status', 'pendente');
      
      if (moradoresError) {
        console.error('Error loading moradores:', moradoresError);
      }
      
      // Filter moradores that belong to this condominium's unidades
      const { data: blocos } = await supabase
        .from('blocos')
        .select('id')
        .eq('condominio_id', condominioId);
      
      const blocoIds = blocos?.map(b => b.id) || [];
      
      const { data: unidadesData } = await supabase
        .from('unidades')
        .select('*')
        .in('bloco_id', blocoIds);
      
      setUnidades(unidadesData || []);
      
      // Filter pending moradores from this condominium
      const unidadeIds = unidadesData?.map(u => u.id) || [];
      const moradoresFiltrados = moradores?.filter(m => unidadeIds.includes(m.unidade_id)) || [];
      
      console.log(`[SECURITY] Aprovação Moradores - Condomínio: ${condominioId}, Pendentes: ${moradoresFiltrados.length}`);
      
      setMoradoresPendentes(moradoresFiltrados);
      
    } catch (err) {
      console.error("[SECURITY] Erro ao carregar dados de aprovação:", err);
      setError("Erro ao carregar moradores pendentes.");
    } finally {
      setLoading(false);
    }
  };

  const handleAprovar = (morador) => {
    setMoradorSelecionado(morador);
    setShowModal(true);
  };

  const handleConfirmarAprovacao = async (dadosAtualizados) => {
    try {
      // VALIDAÇÃO: Condomínio identificado
      if (!userCondominioId) {
        setError("ERRO DE SEGURANÇA: Condomínio não identificado");
        return;
      }

      // VALIDAÇÃO: Condomínio carregado
      if (!condominioAtual) {
        setError("ERRO: Dados do condomínio não carregados");
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      console.log(`[SECURITY] Aprovando morador ${moradorSelecionado.id} para condomínio ${userCondominioId}`);
      
      // Update morador status to 'aprovado'
      const { error: updateError } = await supabase
        .from('moradores')
        .update({ 
          status: 'aprovado',
          updated_at: new Date().toISOString()
        })
        .eq('id', moradorSelecionado.id);
      
      if (updateError) throw updateError;

      await logAction('aprovar_morador', `Morador aprovado`, {
        condominio_id: userCondominioId,
        condominio_nome: condominioAtual?.nome,
        dados_novos: { morador_id: moradorSelecionado.id }
      });
      
      const moradorNome = moradorSelecionado.profiles?.nome || 'Morador';
      setSuccess(`✅ ${moradorNome} foi aprovado com sucesso! O morador já pode fazer login no sistema.`);
      setShowModal(false);
      setMoradorSelecionado(null);
      
      await loadData();
      
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      console.error("[DATA_INTEGRITY] Erro ao aprovar morador:", err);
      setError("Erro ao aprovar morador. Tente novamente.");
      setTimeout(() => setError(""), 5000);
    }
  };

  const handleRecusar = async (morador) => {
    const moradorNome = morador.profiles?.nome || 'este morador';
    
    if (!window.confirm(
      `Tem certeza que deseja RECUSAR o cadastro de ${moradorNome}?\n\n` +
      `O status será alterado para 'rejeitado' e o usuário não terá acesso ao sistema.`
    )) {
      return;
    }
    
    try {
      console.log("🗑️ Recusando morador pendente:", moradorNome);
      
      const { error: updateError } = await supabase
        .from('moradores')
        .update({ status: 'rejeitado' })
        .eq('id', morador.id);
      
      if (updateError) throw updateError;

      // Registrar log
      await logAction('recusar_morador', `Cadastro de ${moradorNome} recusado`, {
        condominio_id: userCondominioId,
        condominio_nome: condominioAtual?.nome,
        dados_anteriores: { morador_id: morador.id }
      });
      
      setSuccess(`Cadastro de ${moradorNome} foi recusado.`);
      await loadData();
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      console.error("❌ Erro ao recusar morador:", err);
      setError("Erro ao recusar cadastro.");
      setTimeout(() => setError(""), 5000);
    }
  };

  const getUnidadeInfo = (morador) => {
    if (!morador.unidades) return "Não definido";
    const unidade = morador.unidades;
    const blocoNome = unidade.blocos?.nome || '';
    return `${blocoNome} - ${unidade.numero}`;
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
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Aprovação de Moradores</h1>
          <p className="text-gray-600">
            Revise e aprove os cadastros pendentes de moradores do condomínio
          </p>
          {condominioAtual && (
            <p className="text-sm text-gray-500 mt-2">
              📍 {condominioAtual.nome} - {condominioAtual.moradores_ativos || 0}/{condominioAtual.limite_moradores} moradores ativos
            </p>
          )}
        </div>

        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Alert className="mb-6 bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Alert variant="destructive" className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {moradoresPendentes.length === 0 ? (
          <Card className="border-2 border-dashed border-gray-300">
            <CardContent className="p-12 text-center">
              <UserCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Nenhum cadastro pendente
              </h3>
              <p className="text-gray-500">
                Todos os cadastros foram revisados! Novos cadastros aparecerão aqui automaticamente.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {moradoresPendentes.map((morador) => (
              <motion.div
                key={morador.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card className="border-l-4 border-l-yellow-500 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <UserIcon className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{morador.profiles?.nome || 'Sem nome'}</CardTitle>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                              <Clock className="w-3 h-3 mr-1" />
                              Aguardando Aprovação
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleAprovar(morador)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Aprovar
                        </Button>
                        <Button
                          onClick={() => handleRecusar(morador)}
                          variant="destructive"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Recusar
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                          <Home className="w-4 h-4" />
                          Unidade
                        </p>
                        <p className="font-medium">{getUnidadeInfo(morador)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Telefone</p>
                        <p className="font-medium">{morador.profiles?.telefone || "Não informado"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                          <Hash className="w-4 h-4" />
                          Proprietário
                        </p>
                        <p className="font-medium">{morador.is_proprietario ? "Sim" : "Não"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {showModal && moradorSelecionado && (
          <AprovarMoradorModal
            morador={moradorSelecionado}
            unidades={unidades}
            onClose={() => {
              setShowModal(false);
              setMoradorSelecionado(null);
            }}
            onConfirm={handleConfirmarAprovacao}
          />
        )}
      </div>
    </div>
  );
}