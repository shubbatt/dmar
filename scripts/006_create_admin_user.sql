-- Create the first admin user (replace with your actual email)
-- This should be run after you've signed up with your admin email
insert into public.admin_users (id, email, role) 
select id, email, 'admin' 
from auth.users 
where email = 'admin@dmartravels.com'
on conflict (id) do nothing;

-- You can also manually insert admin users if needed:
-- insert into public.admin_users (id, email, role) values 
-- ('your-user-id-here', 'your-email@example.com', 'admin');
