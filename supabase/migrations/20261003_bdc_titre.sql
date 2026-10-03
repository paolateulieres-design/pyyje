-- Sujet de la pige, saisi par la rédaction lors d'une commission directe
-- (les offres sur pitch reprennent le titre du pitch).
alter table public.bons_de_commande add column if not exists titre text;
