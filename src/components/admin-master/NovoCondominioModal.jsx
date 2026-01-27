import React, { useState } from 'react';
import { Condominio } from "@/entities/Condominio";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Plus } from "lucide-react";

export default function NovoCondominioModal({ onClose, onSave }) {
  const [formData, setFormData] = useState({
    nome: "",
    cidade: "",
    estado: "SP",
    cep: "",
    endereco: "",
    email: "",
    telefone: "",
    plano: "30_moradores",
    status: "teste",
    limite_moradores: 30,
    moradores_ativos: 0,
    total_usuarios: 0,
    valor_mensalidade: 109,
    data_inicio: new Date().toISOString().split('T')[0],
    observacoes: ""
  });

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const planosValores = {
    '30_moradores': { limite: 30, valor: 109 }, // Value changed
    '50_moradores': { limite: 50, valor: 189 }, // Value changed
    '100_moradores': { limite: 100, valor: 324 }, // Value changed
    '200_moradores': { limite: 200, valor: 524 }, // Value changed
    '500_moradores': { limite: 500, valor: 849 } // Value changed, '500_plus' removed
  };

  const handlePlanoChange = (plano) => {
    const config = planosValores[plano];
    setFormData({
      ...formData,
      plano,
      limite_moradores: config.limite,
      valor_mensalidade: config.valor
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nome.trim()) newErrors.nome = "Nome é obrigatório";
    if (!formData.cidade.trim()) newErrors.cidade = "Cidade é obrigatória";
    if (!formData.estado.trim()) newErrors.estado = "Estado é obrigatório";
    if (!formData.cep.trim()) newErrors.cep = "CEP é obrigatório";
    if (!formData.endereco.trim()) newErrors.endereco = "Endereço é obrigatório";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      // Create condomínio with required fields matching the database schema
      const novoCondominio = await Condominio.create({
        nome: formData.nome,
        cidade: formData.cidade,
        estado: formData.estado,
        cep: formData.cep,
        endereco: formData.endereco || 'Endereço não informado',
        email: formData.email || null,
        telefone: formData.telefone || null,
        ativo: true
      });
      
      console.log("✅ Condomínio criado:", novoCondominio.id);
      alert("✅ Condomínio criado com sucesso!");
      onSave();
    } catch (error) {
      console.error("Erro ao criar condomínio:", error);
      alert("Erro ao criar condomínio: " + (error.message || "Verifique os dados e tente novamente."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Criar Novo Condomínio</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nome">Nome do Condomínio *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({...formData, nome: e.target.value})}
                placeholder="Ex: Residencial Jardim das Flores"
                className={errors.nome ? "border-red-500" : ""}
              />
              {errors.nome && <p className="text-xs text-red-500 mt-1">{errors.nome}</p>}
            </div>

            <div>
              <Label htmlFor="cidade">Cidade *</Label>
              <Input
                id="cidade"
                value={formData.cidade}
                onChange={(e) => setFormData({...formData, cidade: e.target.value})}
                placeholder="Ex: São Paulo"
                className={errors.cidade ? "border-red-500" : ""}
              />
              {errors.cidade && <p className="text-xs text-red-500 mt-1">{errors.cidade}</p>}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="estado">Estado *</Label>
              <Input
                id="estado"
                value={formData.estado}
                onChange={(e) => setFormData({...formData, estado: e.target.value})}
                placeholder="Ex: SP"
                maxLength={2}
                className={errors.estado ? "border-red-500" : ""}
              />
              {errors.estado && <p className="text-xs text-red-500 mt-1">{errors.estado}</p>}
            </div>

            <div>
              <Label htmlFor="cep">CEP *</Label>
              <Input
                id="cep"
                value={formData.cep}
                onChange={(e) => setFormData({...formData, cep: e.target.value})}
                placeholder="Ex: 01234-567"
                className={errors.cep ? "border-red-500" : ""}
              />
              {errors.cep && <p className="text-xs text-red-500 mt-1">{errors.cep}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="endereco">Endereço Completo *</Label>
            <Input
              id="endereco"
              value={formData.endereco}
              onChange={(e) => setFormData({...formData, endereco: e.target.value})}
              placeholder="Rua, número, bairro"
              className={errors.endereco ? "border-red-500" : ""}
            />
            {errors.endereco && <p className="text-xs text-red-500 mt-1">{errors.endereco}</p>}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email de Contato</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="contato@condominio.com"
              />
            </div>

            <div>
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving} className="flex-1 bg-blue-600">
              <Plus className="w-4 h-4 mr-2" />
              {saving ? 'Criando...' : 'Criar Condomínio'}
            </Button>
          </div>
        </CardContent>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving} className="flex-1 bg-blue-600">
              <Plus className="w-4 h-4 mr-2" />
              {saving ? 'Criando...' : 'Criar Condomínio'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}