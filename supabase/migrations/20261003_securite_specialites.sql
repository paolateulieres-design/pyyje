-- ============================================================================
-- 2026-10-03 — Durcissement sécurité (alertes Supabase Advisor) + spécialités
-- ============================================================================

-- 1. is_admin : search_path figé (lint 0011).
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and type_compte = 'admin'
  );
$$;

-- 2. La notification des admins à l'inscription passe dans le trigger
--    handle_new_user. L'ancienne RPC notify_admins_new_account était appelable
--    sans être connecté : n'importe qui pouvait inonder les notifications admin.
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

  insert into public.notifications (destinataire, texte, lien, lue, date)
  select id, 'Nouveau compte en attente de validation (' || new.email || ')', '/admin', false, now()
  from public.profiles
  where type_compte = 'admin';

  return new;
end;
$$;

drop function if exists public.notify_admins_new_account(text);

-- 3. Fonctions internes : plus exécutables sans être connecté.
--    (Postgres accorde EXECUTE à PUBLIC par défaut, d'où le revoke from public.)
revoke execute on function public.handle_new_user() from public, anon, authenticated;

revoke execute on function public.is_admin() from public, anon;
revoke execute on function public.is_pitch_owner(uuid) from public, anon;
revoke execute on function public.pitch_has_envoi_for(uuid, uuid) from public, anon;
revoke execute on function public.envoi_pitch_owner(uuid) from public, anon;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_pitch_owner(uuid) to authenticated;
grant execute on function public.pitch_has_envoi_for(uuid, uuid) to authenticated;
grant execute on function public.envoi_pitch_owner(uuid) to authenticated;

-- resolve_invite_token reste accessible sans compte : c'est voulu (page
-- /invite/[token] pour un pigiste pas encore inscrit). Il faut connaître le
-- token aléatoire de 48 caractères, et la fonction ne renvoie qu'un id.

-- 4. Spécialités : alignement des saisies libres existantes sur la liste
--    commune (lib/specialites.ts), sans tenir compte de la casse ni des accents.
with liste(libelle) as (
  values ('Politique'), ('Économie'), ('Business'), ('Société'), ('International'),
         ('Environnement'), ('Sciences'), ('Santé'), ('Tech'), ('Culture'),
         ('Sport'), ('Lifestyle'), ('Enquête'), ('Reportage')
),
normalise as (
  select p.id,
         coalesce(array_agg(distinct l.libelle) filter (where l.libelle is not null), '{}') as specialites
  from public.profiles p
  left join lateral unnest(p.specialites) s(val) on true
  left join liste l
    on lower(translate(l.libelle, 'ÉéÈèÊêÀàÂâÎîÔôÛûÇç', 'EeEeEeAaAaIiOoUuCc'))
     = lower(translate(trim(s.val), 'ÉéÈèÊêÀàÂâÎîÔôÛûÇç', 'EeEeEeAaAaIiOoUuCc'))
  where p.type_compte = 'pigiste'
  group by p.id
)
update public.profiles p
set specialites = n.specialites
from normalise n
where p.id = n.id;
