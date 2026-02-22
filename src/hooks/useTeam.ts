import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useTeam = () => {
  const { user } = useAuth();

  const { data: teamMembership, isLoading } = useQuery({
    queryKey: ["team-membership", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_members")
        .select("team_id, role, teams(id, name)")
        .eq("user_id", user!.id)
        .limit(1)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  return {
    teamId: teamMembership?.team_id as string | undefined,
    teamName: (teamMembership?.teams as any)?.name as string | undefined,
    role: teamMembership?.role,
    isLoading,
  };
};
