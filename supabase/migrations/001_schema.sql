create extension if not exists pgcrypto;
create table admin_profiles(user_id uuid primary key references auth.users on delete cascade, full_name text, role text not null default 'staff' check (role in ('admin','staff')), created_at timestamptz default now());
create or replace function is_staff() returns boolean language sql security definer stable set search_path=public as $$ select exists(select 1 from admin_profiles where user_id=auth.uid()) $$;
create sequence request_seq start 1001;
create table gift_requests(
 id uuid primary key default gen_random_uuid(), reference text unique not null default ('GFT-'||to_char(now(),'YYMM')||'-'||nextval('request_seq')),
 idempotency_key uuid unique, status text not null default 'New Request', urgent boolean default false,
 occasion text, occasion_date date, delivery_date date, date_flexible boolean default false,
 relationship text, recipient_name text, age_range text, interests text, personality text, likes text, dislikes text,
 feeling text, styles text, personalization text, packaging text,
 currency text, budget text, delivery_location text, delivery_notes text,
 customer_name text not null, customer_email text not null, customer_phone text, contact_channel text, whatsapp_consent boolean default false,
 terms_accepted_at timestamptz not null, marketing_consent boolean default false, quote text, payment_notes text,
 created_at timestamptz default now(), updated_at timestamptz default now());
create table request_notes(id uuid primary key default gen_random_uuid(), request_id uuid not null references gift_requests on delete cascade, body text not null, author uuid default auth.uid(), created_at timestamptz default now());
create table request_status_history(id uuid primary key default gen_random_uuid(), request_id uuid not null references gift_requests on delete cascade, old_status text, new_status text not null, actor uuid, comment text, created_at timestamptz default now());
create table contact_messages(id uuid primary key default gen_random_uuid(), name text not null check(char_length(name)<=200), email text not null check(char_length(email)<=200), phone text, subject text not null check(char_length(subject)<=200), message text not null check(char_length(message)<=2000), handled boolean default false, created_at timestamptz default now());
create table portfolio_items(id uuid primary key default gen_random_uuid(), title text not null, description text, category text, tags text[], featured boolean default false, published boolean default false, sort_order int default 0, created_at timestamptz default now());
create table portfolio_images(id uuid primary key default gen_random_uuid(), item_id uuid references portfolio_items on delete cascade, path text not null, alt_text text not null, sort_order int default 0);
create table faq_items(id uuid primary key default gen_random_uuid(), category text, question text not null, answer text not null, published boolean default false, sort_order int default 0);
create table notification_logs(id uuid primary key default gen_random_uuid(), request_id uuid references gift_requests on delete set null, channel text not null, recipient_kind text, outcome text not null, attempt int default 1, provider_ref text, detail text, created_at timestamptz default now());

alter table admin_profiles enable row level security; alter table gift_requests enable row level security; alter table request_notes enable row level security;
alter table request_status_history enable row level security; alter table contact_messages enable row level security; alter table portfolio_items enable row level security;
alter table portfolio_images enable row level security; alter table faq_items enable row level security; alter table notification_logs enable row level security;

-- Anonymous visitors: no access to gift_requests (writes go through the submit-request Edge Function with the service role).
create policy staff_all on gift_requests for all using (is_staff()) with check (is_staff());
create policy staff_all on request_notes for all using (is_staff()) with check (is_staff());
create policy staff_read on request_status_history for select using (is_staff());
create policy staff_all on notification_logs for select using (is_staff());
create policy staff_read on admin_profiles for select using (is_staff());
create policy anon_insert on contact_messages for insert to anon, authenticated with check (handled=false);
create policy staff_all on contact_messages for select using (is_staff());
create policy staff_upd on contact_messages for update using (is_staff());
create policy pub_read on portfolio_items for select using (published or is_staff());
create policy staff_w on portfolio_items for all using (is_staff()) with check (is_staff());
create policy pub_read on portfolio_images for select using (exists(select 1 from portfolio_items p where p.id=item_id and (p.published or is_staff())));
create policy staff_w on portfolio_images for all using (is_staff()) with check (is_staff());
create policy pub_read on faq_items for select using (published or is_staff());
create policy staff_w on faq_items for all using (is_staff()) with check (is_staff());

-- Status changes always write history.
create or replace function change_request_status(p_id uuid, p_status text, p_comment text) returns void language plpgsql security definer set search_path=public as $$
declare old text; begin
 if not is_staff() then raise exception 'not authorized'; end if;
 select status into old from gift_requests where id=p_id;
 update gift_requests set status=p_status, updated_at=now() where id=p_id;
 insert into request_status_history(request_id,old_status,new_status,actor,comment) values(p_id,old,p_status,auth.uid(),p_comment);
end $$;
