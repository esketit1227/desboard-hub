import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTeam } from "./useTeam";
import { useToast } from "./use-toast";

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category_id: string | null;
  income_source_id: string | null;
  payment_method: string | null;
  transaction_date: string;
  created_by: string;
  created_at: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  color: string;
}

export interface IncomeSource {
  id: string;
  name: string;
}

export const useTransactions = () => {
  const { user } = useAuth();
  const { teamId } = useTeam();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const transactionsQuery = useQuery({
    queryKey: ["transactions", teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("team_id", teamId!)
        .order("transaction_date", { ascending: false });
      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!teamId,
  });

  const categoriesQuery = useQuery({
    queryKey: ["expense-categories", teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expense_categories")
        .select("*")
        .eq("team_id", teamId!);
      if (error) throw error;
      return data as ExpenseCategory[];
    },
    enabled: !!teamId,
  });

  const incomeSourcesQuery = useQuery({
    queryKey: ["income-sources", teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("income_sources")
        .select("*")
        .eq("team_id", teamId!);
      if (error) throw error;
      return data as IncomeSource[];
    },
    enabled: !!teamId,
  });

  const addTransaction = useMutation({
    mutationFn: async (tx: {
      description: string;
      amount: number;
      type: "income" | "expense";
      category_id?: string;
      income_source_id?: string;
      payment_method?: string;
      transaction_date?: string;
    }) => {
      const { error } = await supabase.from("transactions").insert({
        team_id: teamId!,
        created_by: user!.id,
        description: tx.description,
        amount: tx.type === "expense" ? -Math.abs(tx.amount) : Math.abs(tx.amount),
        type: tx.type,
        category_id: tx.category_id || null,
        income_source_id: tx.income_source_id || null,
        payment_method: tx.payment_method || null,
        transaction_date: tx.transaction_date || new Date().toISOString().split("T")[0],
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions", teamId] });
      toast({ title: "Transaction added" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const deleteTransaction = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("transactions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions", teamId] });
    },
  });

  const addCategory = useMutation({
    mutationFn: async (cat: { name: string; color: string }) => {
      const { error } = await supabase.from("expense_categories").insert({ team_id: teamId!, ...cat });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["expense-categories", teamId] }),
  });

  const addIncomeSource = useMutation({
    mutationFn: async (source: { name: string }) => {
      const { error } = await supabase.from("income_sources").insert({ team_id: teamId!, ...source });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["income-sources", teamId] }),
  });

  return {
    transactions: transactionsQuery.data ?? [],
    categories: categoriesQuery.data ?? [],
    incomeSources: incomeSourcesQuery.data ?? [],
    isLoading: transactionsQuery.isLoading || categoriesQuery.isLoading,
    addTransaction,
    deleteTransaction,
    addCategory,
    addIncomeSource,
  };
};
