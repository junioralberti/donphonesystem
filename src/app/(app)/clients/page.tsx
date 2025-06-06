// src/app/(app)/clients/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription
} from "@/components/ui/dialog";
import { PlusCircle, Loader2, AlertTriangle } from "lucide-react";
import { ClientForm } from "@/components/clients/client-form";
import { ClientsTable } from "@/components/clients/clients-table";
import { getClients, addClient, updateClient, deleteClient } from "@/services/clientService";
import type { Client } from "@/lib/schemas/client";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const initialClientFormValues: Partial<Client> = {
  name: "",
  email: "",
  phone: "",
  address: "",
};

export default function ClientsPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [addClientFormDefaultValues, setAddClientFormDefaultValues] = useState<Partial<Client>>(initialClientFormValues);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: clients, isLoading: isLoadingClients, error: clientsError, refetch: refetchClients } = useQuery<Client[], Error>({
    queryKey: ["clients"],
    queryFn: getClients,
  });

  useEffect(() => {
    if (clientsError) {
      toast({
        title: "Erro ao Carregar Clientes",
        description: "Não foi possível buscar os dados dos clientes.",
        variant: "destructive",
        duration: 10000,
      });
    }
  }, [clientsError, toast]);

  const addClientMutation = useMutation({
    mutationFn: (newClient: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => addClient(newClient),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast({ title: "Cliente Adicionado", description: "Novo cliente adicionado com sucesso." });
      setIsAddDialogOpen(false);
      setAddClientFormDefaultValues(initialClientFormValues);
    },
    onError: (error: Error) => {
      toast({ title: "Erro", description: `Erro: ${error.message}`, variant: "destructive" });
    },
  });

  const updateClientMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<Client, 'id' | 'createdAt'>> }) => updateClient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast({ title: "Sucesso!", description: "Cliente atualizado." });
      setIsEditDialogOpen(false);
      setEditingClient(null);
    },
    onError: (error: Error) => {
      toast({ title: "Erro", description: `Erro: ${error.message}`, variant: "destructive" });
    },
  });

  const deleteClientMutation = useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast({ title: "Sucesso!", description: "Cliente excluído." });
    },
    onError: (error: Error) => {
      toast({ title: "Erro", description: `Erro: ${error.message}`, variant: "destructive" });
    },
  });

  const handleAddClient = async (data: Client) => {
    const { id, createdAt, updatedAt, ...clientData } = data;
    await addClientMutation.mutateAsync(clientData);
  };

  const handleUpdateClient = async (data: Client) => {
    if (!editingClient?.id) return;
    const { id, createdAt, updatedAt, ...clientData } = data;
    await updateClientMutation.mutateAsync({ id: editingClient.id, data: clientData });
  };

  const handleDeleteClient = async (clientId: string) => {
    await deleteClientMutation.mutateAsync(clientId);
  };

  const openAddDialog = () => {
    setAddClientFormDefaultValues(initialClientFormValues);
    setIsAddDialogOpen(true);
  };

  const ClientListSkeleton = () => (
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-40 rounded" />
            <Skeleton className="h-3 w-60 rounded" />
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-semibold">Gerenciamento de Clientes</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Cliente</DialogTitle>
              <DialogDescription>Preencha os dados do novo cliente.</DialogDescription>
            </DialogHeader>
            <ClientForm onSubmit={handleAddClient} isLoading={addClientMutation.isPending} defaultValues={addClientFormDefaultValues} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
          <CardDescription>Visualize, edite ou remova clientes cadastrados.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingClients ? (
            <ClientListSkeleton />
          ) : clientsError ? (
            <div className="flex flex-col items-center justify-center gap-3 py-10 text-center text-destructive">
              <AlertTriangle className="h-12 w-12" />
              <p className="text-lg font-medium">Erro ao carregar clientes</p>
              <p className="text-sm text-muted-foreground">{clientsError.message}</p>
              <Button onClick={() => refetchClients()} className="mt-3">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Tentar Novamente
              </Button>
            </div>
          ) : (
            <ClientsTable
              clients={clients || []}
              onEdit={(c) => { setEditingClient(c); setIsEditDialogOpen(true); }}
              onDelete={handleDeleteClient}
              isLoadingDeleteForId={deleteClientMutation.isPending ? deleteClientMutation.variables : null}
            />
          )}
        </CardContent>
      </Card>

      {editingClient && (
        <Dialog open={isEditDialogOpen} onOpenChange={(v) => { setIsEditDialogOpen(v); if (!v) setEditingClient(null); }}>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>Editar Cliente</DialogTitle>
              <DialogDescription>Atualize os dados do cliente selecionado.</DialogDescription>
            </DialogHeader>
            <ClientForm onSubmit={handleUpdateClient} defaultValues={editingClient} isEditing isLoading={updateClientMutation.isPending} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
