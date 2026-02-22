
-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Teams table
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Team members
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id)
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Security definer function for team membership check
CREATE OR REPLACE FUNCTION public.is_team_member(_user_id UUID, _team_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE user_id = _user_id AND team_id = _team_id
  )
$$;

-- Team RLS
CREATE POLICY "Team members can view their teams" ON public.teams FOR SELECT TO authenticated
  USING (public.is_team_member(auth.uid(), id));
CREATE POLICY "Authenticated users can create teams" ON public.teams FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Team members RLS
CREATE POLICY "Team members can view membership" ON public.team_members FOR SELECT TO authenticated
  USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "Team creators can add members" ON public.team_members FOR INSERT TO authenticated
  WITH CHECK (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "Users can remove themselves" ON public.team_members FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Expense categories
CREATE TABLE public.expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'hsl(220 13% 18%)',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team members can view categories" ON public.expense_categories FOR SELECT TO authenticated
  USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "Team members can manage categories" ON public.expense_categories FOR INSERT TO authenticated
  WITH CHECK (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "Team members can update categories" ON public.expense_categories FOR UPDATE TO authenticated
  USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "Team members can delete categories" ON public.expense_categories FOR DELETE TO authenticated
  USING (public.is_team_member(auth.uid(), team_id));

-- Income sources
CREATE TABLE public.income_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.income_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team members can view sources" ON public.income_sources FOR SELECT TO authenticated
  USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "Team members can manage sources" ON public.income_sources FOR INSERT TO authenticated
  WITH CHECK (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "Team members can update sources" ON public.income_sources FOR UPDATE TO authenticated
  USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "Team members can delete sources" ON public.income_sources FOR DELETE TO authenticated
  USING (public.is_team_member(auth.uid(), team_id));

-- Transactions
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category_id UUID REFERENCES public.expense_categories(id) ON DELETE SET NULL,
  income_source_id UUID REFERENCES public.income_sources(id) ON DELETE SET NULL,
  payment_method TEXT,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team members can view transactions" ON public.transactions FOR SELECT TO authenticated
  USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "Team members can create transactions" ON public.transactions FOR INSERT TO authenticated
  WITH CHECK (public.is_team_member(auth.uid(), team_id) AND auth.uid() = created_by);
CREATE POLICY "Team members can update transactions" ON public.transactions FOR UPDATE TO authenticated
  USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "Team members can delete transactions" ON public.transactions FOR DELETE TO authenticated
  USING (public.is_team_member(auth.uid(), team_id));

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-create a personal team on signup and add user as owner
CREATE OR REPLACE FUNCTION public.handle_new_user_team()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  new_team_id UUID;
BEGIN
  INSERT INTO public.teams (name, created_by) VALUES ('My Team', NEW.id)
  RETURNING id INTO new_team_id;
  INSERT INTO public.team_members (team_id, user_id, role) VALUES (new_team_id, NEW.id, 'owner');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_team
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_team();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_transactions_team_id ON public.transactions(team_id);
CREATE INDEX idx_transactions_date ON public.transactions(transaction_date);
CREATE INDEX idx_transactions_type ON public.transactions(type);
CREATE INDEX idx_team_members_user_id ON public.team_members(user_id);
