"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";
import { UserForm } from '@/components/users/user-form';
import { addUser } from '@/services/userService';
import { getEstablishmentSettings } from '@/services/settingService';
import type { User, UserRole } from '@/lib/schemas/user';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';

type UserDataToSave = Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'password' | 'confirmPassword'>;

interface MockStoredUser extends UserDataToSave {
  password?: string;
}

export default function LoginPage() {
  const [email, setEmail] = useState('teste@donphone.com');
  const [password, setPassword] = useState('Bettina03*');
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);
  const { toast } = useToast();

  // Estado da logo
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const settings = await getEstablishmentSettings();
        setLogoUrl(settings?.logoUrl || null);
      } catch (error) {
        console.error("Erro ao buscar logo:", error);
      }
    };
    fetchLogo();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (email === 'teste@donphone.com' && password === 'Bettina03*') {
      login('admin');
    } else {
      const storedMockUsersString = localStorage.getItem('mock_users');
      const mockUsers: MockStoredUser[] = storedMockUsersString ? JSON.parse(storedMockUsersString) : [];

      const matchedUser = mockUsers.find(u => u.email === email && u.password === password);

      if (matchedUser) {
        login(matchedUser.role as 'admin' | 'user' || 'user');
      } else {
        setError('Credenciais inválidas. Por favor, tente novamente.');
      }
    }
  };

  const addUserMutation = useMutation({
    mutationFn: (userData: { firestoreData: UserDataToSave, formData: User }) => addUser(userData.firestoreData),
    onSuccess: (docId, variables) => {
      const { firestoreData, formData } = variables;
      toast({
        title: "Cadastro Realizado!",
        description: "Seu usuário foi criado com sucesso. Agora você pode fazer login.",
        variant: "default"
      });

      const storedMockUsersString = localStorage.getItem('mock_users');
      const mockUsers: MockStoredUser[] = storedMockUsersString ? JSON.parse(storedMockUsersString) : [];

      mockUsers.push({
        email: firestoreData.email,
        password: formData.password,
        name: firestoreData.name,
        role: firestoreData.role
      });
      localStorage.setItem('mock_users', JSON.stringify(mockUsers));

      setIsRegisterDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro no Cadastro",
        description: `Não foi possível criar o usuário: ${error.message}`,
        variant: "destructive"
      });
    },
  });

  const handleRegisterUser = async (formData: User) => {
    const { id, createdAt, updatedAt, password, confirmPassword, ...userDataToSave } = formData;
    const firestoreData: UserDataToSave = { ...userDataToSave, role: formData.role || 'user' };
    await addUserMutation.mutateAsync({ firestoreData, formData });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm shadow-xl">
        <CardHeader className="items-center text-center">
          <div className="mb-4 flex justify-center">
            <Image
              src={logoUrl || "/donphone-logo.png"}
              alt="Logo do Estabelecimento"
              width={160}
              height={60}
              className="rounded object-contain"
              priority
            />
          </div>
          <CardTitle className="font-headline text-3xl">Sistema DonPhone</CardTitle>
          <CardDescription>Por favor, entre para continuar</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Erro de Login</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="text-base"
              />
            </div>
            <Button type="submit" className="w-full text-base">
              Entrar
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Button
              variant="link"
              type="button"
              onClick={() => setIsRegisterDialogOpen(true)}
              className="text-sm px-0"
            >
              Cadastrar Novo Usuário
            </Button>
          </div>
        </CardContent>
        <CardFooter className="justify-center pt-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Sistema DonPhone.
          </p>
        </CardFooter>
      </Card>

      <Dialog open={isRegisterDialogOpen} onOpenChange={setIsRegisterDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cadastrar Novo Usuário</DialogTitle>
            <DialogDescription>
              Preencha seus dados para criar uma conta. Após o cadastro, faça login normalmente.
            </DialogDescription>
          </DialogHeader>
          <UserForm
            onSubmit={handleRegisterUser}
            isLoading={addUserMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
