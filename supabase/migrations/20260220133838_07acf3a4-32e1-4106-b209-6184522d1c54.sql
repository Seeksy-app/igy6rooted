
ALTER TABLE public.canvassing_leads
ADD COLUMN estimated_delivery_date date NULL,
ADD COLUMN mailing_name text NULL;
