import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Package, Loader2, Eye, EyeOff, Mail, Lock, User, Phone } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { createPageUrl } from "@/utils";

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, isLoadingAuth } = useAuth();
  
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Login form
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  // Register form
  const [registerData, setRegisterData] = useState({
    nome: '',
    email: '',
    telefone: '',
    password: '',
    confirmPassword: ''
  });

  // Password reset form
  const [resetEmail, setResetEmail] = useState('');
  const [showResetForm, setShowResetForm] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoadingAuth && isAuthenticated) {
      const redirectTo = searchParams.get('redirect') || 'Dashboard';
      navigate(createPageUrl(redirectTo));
    }
  }, [isAuthenticated, isLoadingAuth, navigate, searchParams]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password
      });

      if (error) throw error;

      // Redirect will happen automatically via useEffect
      const redirectTo = searchParams.get('redirect') || 'Dashboard';
      navigate(createPageUrl(redirectTo));
    } catch (err) {
      console.error('Login error:', err);
      if (err.message.includes('Invalid login credentials')) {
        setError('Email ou senha incorretos. Verifique seus dados e tente novamente.');
      } else if (err.message.includes('Email not confirmed')) {
        setError('Por favor, confirme seu email antes de fazer login. Verifique sua caixa de entrada.');
      } else {
        setError(err.message || 'Erro ao fazer login. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validate passwords match
    if (registerData.password !== registerData.confirmPassword) {
      setError('As senhas não coincidem.');
      setLoading(false);
      return;
    }

    // Validate password strength
    if (registerData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: registerData.email,
        password: registerData.password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            nome: registerData.nome,
            telefone: registerData.telefone
          }
        }
      });

      if (error) throw error;

      if (data.user && !data.session) {
        // Email confirmation required
        setSuccess('Cadastro realizado! Verifique seu email para confirmar a conta.');
        setActiveTab('login');
      } else if (data.session) {
        // Auto-login (email confirmation disabled)
        const redirectTo = searchParams.get('redirect') || 'Dashboard';
        navigate(createPageUrl(redirectTo));
      }
    } catch (err) {
      console.error('Register error:', err);
      if (err.message.includes('already registered')) {
        setError('Este email já está cadastrado. Tente fazer login ou recuperar sua senha.');
      } else {
        setError(err.message || 'Erro ao criar conta. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/Auth?tab=reset`
      });

      if (error) throw error;

      setSuccess('Email de recuperação enviado! Verifique sua caixa de entrada.');
      setShowResetForm(false);
      setResetEmail('');
    } catch (err) {
      console.error('Password reset error:', err);
      setError(err.message || 'Erro ao enviar email de recuperação.');
    } finally {
      setLoading(false);
    }
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
            <Package className="w-7 h-7 text-white" />
          </div>
          <span className="text-2xl font-bold text-gray-900">PackageManager</span>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl">
              {showResetForm ? 'Recuperar Senha' : 'Bem-vindo'}
            </CardTitle>
            <CardDescription>
              {showResetForm 
                ? 'Digite seu email para receber o link de recuperação'
                : 'Faça login ou crie sua conta para continuar'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="mb-4 bg-green-50 border-green-200">
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            {showResetForm ? (
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="seu@email.com"
                      className="pl-10"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    'Enviar Link de Recuperação'
                  )}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setShowResetForm(false)}
                >
                  Voltar ao Login
                </Button>
              </form>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Entrar</TabsTrigger>
                  <TabsTrigger value="register">Criar Conta</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="seu@email.com"
                          className="pl-10"
                          value={loginData.email}
                          onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password">Senha</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-10 pr-10"
                          value={loginData.password}
                          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Entrando...
                        </>
                      ) : (
                        'Entrar'
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="link"
                      className="w-full text-sm text-gray-600"
                      onClick={() => setShowResetForm(true)}
                    >
                      Esqueceu sua senha?
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-nome">Nome Completo</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="register-nome"
                          type="text"
                          placeholder="Seu nome"
                          className="pl-10"
                          value={registerData.nome}
                          onChange={(e) => setRegisterData({ ...registerData, nome: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="register-email"
                          type="email"
                          placeholder="seu@email.com"
                          className="pl-10"
                          value={registerData.email}
                          onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-telefone">Telefone (opcional)</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="register-telefone"
                          type="tel"
                          placeholder="(11) 99999-9999"
                          className="pl-10"
                          value={registerData.telefone}
                          onChange={(e) => setRegisterData({ ...registerData, telefone: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-password">Senha</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="register-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Mínimo 6 caracteres"
                          className="pl-10 pr-10"
                          value={registerData.password}
                          onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-confirm-password">Confirmar Senha</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          id="register-confirm-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Digite a senha novamente"
                          className="pl-10"
                          value={registerData.confirmPassword}
                          onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                          required
                          minLength={6}
                        />
                      </div>
                    </div>

                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Criando conta...
                        </>
                      ) : (
                        'Criar Conta'
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>

        {/* Back to home */}
        <div className="text-center mt-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-gray-600"
          >
            ← Voltar para o site
          </Button>
        </div>
      </div>
    </div>
  );
}
