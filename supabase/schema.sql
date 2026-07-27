-- ============================================================================
-- PYYJE — Plateforme Piges — schéma Supabase (Postgres)
-- Miroir du document "Specs MVP — Plateforme Piges"
-- À exécuter une fois dans l'éditeur SQL du projet Supabase.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. PROFILES (étend auth.users)
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  type_compte text not null check (type_compte in ('pigiste', 'redaction', 'admin')),
  prenom text,
  nom text,
  photo text,
  bio text,
  specialites text[] default '{}',
  portfolio_url text,
  portfolio_liens text[] default '{}',
  num_carte_presse text,
  fiche_renseignement text,
  nom_media text,
  logo text,
  site_web text,
  rubriques text[] default '{}',
  statut_compte text not null default 'en_attente' check (statut_compte in ('en_attente', 'valide', 'refuse')),
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 2. PITCHES
-- ----------------------------------------------------------------------------
create table if not exists public.pitches (
  id uuid primary key default gen_random_uuid(),
  titre text not null,
  resume text,
  angle text,
  auteur uuid not null references public.profiles (id) on delete cascade,
  date_creation timestamptz not null default now(),
  statut text not null default 'envoye' check (statut in ('brouillon', 'envoye', 'en_cours', 'cloture'))
);

-- ----------------------------------------------------------------------------
-- 3. PITCH_ENVOIS — un enregistrement par (pitch x rédaction)
-- ----------------------------------------------------------------------------
create table if not exists public.pitch_envois (
  id uuid primary key default gen_random_uuid(),
  pitch uuid not null references public.pitches (id) on delete cascade,
  redaction uuid not null references public.profiles (id) on delete cascade,
  rubrique_ciblee text,
  date_envoi timestamptz not null default now(),
  statut text not null default 'envoye' check (
    statut in ('envoye', 'vu', 'refuse', 'offre_faite', 'accepte_par_pigiste', 'retire')
  ),
  message_refus text
);

-- ----------------------------------------------------------------------------
-- 4. BONS_DE_COMMANDE
-- ----------------------------------------------------------------------------
create table if not exists public.bons_de_commande (
  id uuid primary key default gen_random_uuid(),
  pitch_envoi uuid references public.pitch_envois (id) on delete cascade,
  source text not null check (source in ('pitch_accepte', 'commission_directe')),
  email_invite text,
  token_invitation text unique,
  pigiste uuid references public.profiles (id) on delete set null,
  redaction uuid not null references public.profiles (id) on delete cascade,
  prix numeric not null,
  deadline date,
  format text,
  nb_signes integer,
  notes text,
  statut text not null default 'propose' check (
    statut in ('propose', 'accepte', 'refuse', 'retire', 'valide')
  ),
  paiement_effectue boolean not null default false,
  date_creation timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 5. ARTICLES — versionnés, jamais écrasés
-- ----------------------------------------------------------------------------
create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  bon_de_commande uuid not null references public.bons_de_commande (id) on delete cascade,
  contenu text,
  fichier text,
  version integer not null default 1,
  date_soumission timestamptz not null default now(),
  statut text not null default 'soumis' check (statut in ('soumis', 'corrections_demandees', 'valide'))
);

-- ----------------------------------------------------------------------------
-- 6. COMMENTAIRES
-- ----------------------------------------------------------------------------
create table if not exists public.commentaires (
  id uuid primary key default gen_random_uuid(),
  article uuid not null references public.articles (id) on delete cascade,
  auteur uuid not null references public.profiles (id) on delete cascade,
  texte text not null,
  date timestamptz not null default now(),
  resolu boolean not null default false
);

-- ----------------------------------------------------------------------------
-- 7. NOTIFICATIONS
-- ----------------------------------------------------------------------------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  destinataire uuid not null references public.profiles (id) on delete cascade,
  texte text not null,
  lien text,
  lue boolean not null default false,
  date timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Index utiles
-- ----------------------------------------------------------------------------
create index if not exists idx_pitch_envois_pitch on public.pitch_envois (pitch);
create index if not exists idx_pitch_envois_redaction on public.pitch_envois (redaction);
create index if not exists idx_bdc_pitch_envoi on public.bons_de_commande (pitch_envoi);
create index if not exists idx_bdc_pigiste on public.bons_de_commande (pigiste);
create index if not exists idx_bdc_redaction on public.bons_de_commande (redaction);
create index if not exists idx_bdc_token on public.bons_de_commande (token_invitation);
create index if not exists idx_articles_bdc on public.articles (bon_de_commande);
create index if not exists idx_commentaires_article on public.commentaires (article);
create index if not exists idx_notifications_destinataire on public.notifications (destinataire);

-- ----------------------------------------------------------------------------
-- Helper : vérifie si l'utilisateur courant est admin (SECURITY DEFINER pour
-- éviter la récursion RLS sur la table profiles elle-même).
-- ----------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and type_compte = 'admin'
  );
$$;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
alter table public.profiles enable row level security;
alter table public.pitches enable row level security;
alter table public.pitch_envois enable row level security;
alter table public.bons_de_commande enable row level security;
alter table public.articles enable row level security;
alter table public.commentaires enable row level security;
alter table public.notifications enable row level security;

-- PROFILES ---------------------------------------------------------------
create policy "profiles_select_authenticated" on public.profiles
  for select using (auth.role() = 'authenticated');

create policy "profiles_insert_self" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles_update_self_or_admin" on public.profiles
  for update using (auth.uid() = id or public.is_admin());

-- PITCHES ------------------------------------------------------------------
create policy "pitches_select" on public.pitches
  for select using (
    auteur = auth.uid()
    or public.is_admin()
    or exists (
      select 1 from public.pitch_envois pe
      where pe.pitch = pitches.id and pe.redaction = auth.uid()
    )
  );

create policy "pitches_insert_own" on public.pitches
  for insert with check (auteur = auth.uid());

create policy "pitches_update" on public.pitches
  for update using (
    auteur = auth.uid()
    or public.is_admin()
    or exists (
      select 1 from public.pitch_envois pe
      where pe.pitch = pitches.id and pe.redaction = auth.uid()
    )
  );

-- PITCH_ENVOIS ---------------------------------------------------------------
-- Confidentialité : une rédaction ne voit que SES propres envois, jamais ceux
-- des autres rédactions pour un même pitch.
create policy "pitch_envois_select" on public.pitch_envois
  for select using (
    redaction = auth.uid()
    or public.is_admin()
    or exists (select 1 from public.pitches p where p.id = pitch_envois.pitch and p.auteur = auth.uid())
  );

create policy "pitch_envois_insert" on public.pitch_envois
  for insert with check (
    exists (select 1 from public.pitches p where p.id = pitch_envois.pitch and p.auteur = auth.uid())
  );

create policy "pitch_envois_update" on public.pitch_envois
  for update using (
    redaction = auth.uid()
    or public.is_admin()
    or exists (select 1 from public.pitches p where p.id = pitch_envois.pitch and p.auteur = auth.uid())
  );

-- BONS_DE_COMMANDE -----------------------------------------------------------
create policy "bdc_select" on public.bons_de_commande
  for select using (
    redaction = auth.uid()
    or pigiste = auth.uid()
    or public.is_admin()
    or exists (
      select 1 from public.pitch_envois pe
      join public.pitches p on p.id = pe.pitch
      where pe.id = bons_de_commande.pitch_envoi and p.auteur = auth.uid()
    )
  );

create policy "bdc_insert" on public.bons_de_commande
  for insert with check (redaction = auth.uid() or public.is_admin());

create policy "bdc_update" on public.bons_de_commande
  for update using (
    redaction = auth.uid()
    or pigiste = auth.uid()
    or public.is_admin()
    or exists (
      select 1 from public.pitch_envois pe
      join public.pitches p on p.id = pe.pitch
      where pe.id = bons_de_commande.pitch_envoi and p.auteur = auth.uid()
    )
  );

-- ARTICLES ---------------------------------------------------------------
create policy "articles_select" on public.articles
  for select using (
    public.is_admin()
    or exists (
      select 1 from public.bons_de_commande bc
      where bc.id = articles.bon_de_commande
        and (bc.redaction = auth.uid() or bc.pigiste = auth.uid())
    )
  );

create policy "articles_insert" on public.articles
  for insert with check (
    exists (
      select 1 from public.bons_de_commande bc
      where bc.id = articles.bon_de_commande and bc.pigiste = auth.uid()
    )
  );

create policy "articles_update" on public.articles
  for update using (
    public.is_admin()
    or exists (
      select 1 from public.bons_de_commande bc
      where bc.id = articles.bon_de_commande and bc.redaction = auth.uid()
    )
  );

-- COMMENTAIRES ---------------------------------------------------------------
create policy "commentaires_select" on public.commentaires
  for select using (
    public.is_admin()
    or exists (
      select 1 from public.articles a
      join public.bons_de_commande bc on bc.id = a.bon_de_commande
      where a.id = commentaires.article
        and (bc.redaction = auth.uid() or bc.pigiste = auth.uid())
    )
  );

create policy "commentaires_insert" on public.commentaires
  for insert with check (
    auteur = auth.uid()
    and exists (
      select 1 from public.articles a
      join public.bons_de_commande bc on bc.id = a.bon_de_commande
      where a.id = commentaires.article and bc.redaction = auth.uid()
    )
  );

-- NOTIFICATIONS ---------------------------------------------------------------
create policy "notifications_select_own" on public.notifications
  for select using (destinataire = auth.uid() or public.is_admin());

create policy "notifications_update_own" on public.notifications
  for update using (destinataire = auth.uid());

-- Insertion ouverte à tout utilisateur authentifié : les notifications sont
-- toujours créées par un tiers (ex : la rédaction notifie le pigiste). Le
-- contenu est purement informatif (texte + lien), sans risque de sécurité
-- réel pour ce MVP interne.
create policy "notifications_insert_authenticated" on public.notifications
  for insert with check (auth.role() = 'authenticated');

-- ----------------------------------------------------------------------------
-- Auto-provisioning du profil à la création du compte auth + notifications
-- admin + résolution des tokens d'invitation, sans clé service_role.
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, type_compte, prenom, nom, nom_media, statut_compte, rubriques, specialites)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'type_compte', 'pigiste'),
    new.raw_user_meta_data->>'prenom',
    new.raw_user_meta_data->>'nom',
    new.raw_user_meta_data->>'nom_media',
    'en_attente',
    '{}',
    '{}'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.notify_admins_new_account(p_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (destinataire, texte, lien, lue, date)
  select id, 'Nouveau compte en attente de validation (' || p_email || ')', '/admin', false, now()
  from public.profiles
  where type_compte = 'admin';
end;
$$;

grant execute on function public.notify_admins_new_account(text) to anon, authenticated;

create or replace function public.resolve_invite_token(p_token text)
returns table (bc_id uuid, has_pigiste boolean)
language sql
security definer
stable
set search_path = public
as $$
  select id, (pigiste is not null) from public.bons_de_commande where token_invitation = p_token;
$$;

grant execute on function public.resolve_invite_token(text) to anon, authenticated;

create policy "bdc_update_invite_link" on public.bons_de_commande
  for update
  using (
    pigiste is null
    and email_invite is not null
    and lower(email_invite) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
  with check (
    pigiste = auth.uid()
  );

-- ============================================================================
-- Compte admin de démarrage
-- ----------------------------------------------------------------------------
-- 1. Créez le compte via l'écran d'inscription du site (n'importe quel rôle).
-- 2. Puis exécutez, en remplaçant l'email :
--
-- update public.profiles set type_compte = 'admin', statut_compte = 'valide'
-- where email = 'vous@exemple.com';
-- ============================================================================
