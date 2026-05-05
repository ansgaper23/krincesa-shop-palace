CREATE TABLE public.r2_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id text,
  access_key_id text,
  secret_access_key text,
  bucket_name text,
  public_url_base text,
  enabled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.r2_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view r2 config"
  ON public.r2_config FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert r2 config"
  ON public.r2_config FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update r2 config"
  ON public.r2_config FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete r2 config"
  ON public.r2_config FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_r2_config_updated_at
  BEFORE UPDATE ON public.r2_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();