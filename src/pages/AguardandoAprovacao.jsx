import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, LogOut, RefreshCw, CheckCircle, Building2, Mail } from "lucide-react";
import { useAuth } from '@/lib/AuthContext';
import { motion } from 'framer-motion';

export default function AguardandoAprovacao() {
  const { user, logout } = useAuth();
  
  const handleLogout = async () => {
    await logout(true);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-orange-50 px-4 py-12">
      <motion.div 
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="shadow-xl border-0 overflow-hidden">
          {/* Header decorativo */}
          <div className="h-2 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400" />
          
          <CardHeader className="text-center pt-8 pb-4">
            <motion.div 
              className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4"
              animate={{ 
                scale: [1, 1.05, 1],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Clock className="w-10 h-10 text-amber-600" />
            </motion.div>
            
            <CardTitle className="text-2xl text-gray-900">
              Aguardando Aprovação
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Sua conta foi criada com sucesso!
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-6 pb-8">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium mb-1">Próximos passos:</p>
                  <ul className="list-disc list-inside space-y-1 text-amber-700">
                    <li>O síndico do seu condomínio irá revisar seu cadastro</li>
                    <li>Você receberá um email quando for aprovado</li>
                    <li>Após aprovação, terá acesso completo ao sistema</li>
                  </ul>
                </div>
              </div>
            </div>

            {user?.email && (
              <div className="bg-gray-50 rounded-lg p-3 mb-6 flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">{user.email}</span>
              </div>
            )}

            <div className="space-y-3">
              <Button 
                onClick={handleRefresh} 
                className="w-full bg-amber-600 hover:bg-amber-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Verificar Status
              </Button>
              
              <Button 
                onClick={handleLogout} 
                variant="outline" 
                className="w-full"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Conta criada em {new Date().toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-gray-500 mt-6">
          Dúvidas? Entre em contato com a administração do seu condomínio.
        </p>
      </motion.div>
    </div>
  );
}
