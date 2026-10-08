-- ============================================
-- FIX: Ambiguous Column Reference Error
-- ============================================
-- Error: "column reference 'wedding_id' is ambiguous"
-- Penyebab: Nama kolom dan variabel bentrok
-- Solusi: Gunakan alias tabel yang eksplisit

CREATE OR REPLACE FUNCTION public.create_initial_wedding()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_wedding_id UUID;
  v_user_id UUID;
  v_role TEXT;
BEGIN
  -- Get current user ID
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Check if user already has a wedding in wedding_members
  -- Gunakan alias tabel 'wm' untuk menghindari ambiguity
  SELECT wm.wedding_id INTO v_wedding_id
  FROM public.wedding_members wm
  WHERE wm.user_id = v_user_id
  LIMIT 1;
  
  -- If already exists, return existing wedding_id
  IF v_wedding_id IS NOT NULL THEN
    RETURN v_wedding_id;
  END IF;
  
  -- Check if user already has wedding_data (legacy data)
  -- Gunakan alias tabel 'wd' untuk menghindari ambiguity
  SELECT wd.id INTO v_wedding_id
  FROM public.wedding_data wd
  WHERE wd.user_id = v_user_id
  LIMIT 1;
  
  -- If legacy data exists, just add to wedding_members
  IF v_wedding_id IS NOT NULL THEN
    INSERT INTO public.wedding_members (wedding_id, user_id, role)
    VALUES (v_wedding_id, v_user_id, 'owner')
    ON CONFLICT (wedding_id, user_id) DO NOTHING;
    
    RETURN v_wedding_id;
  END IF;
  
  -- Create new wedding
  INSERT INTO public.wedding_data (
    user_id,
    settings,
    budget_items,
    savings,
    guests,
    vendors,
    tasks
  ) VALUES (
    v_user_id,
    '{}'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb
  )
  RETURNING id INTO v_wedding_id;
  
  -- Add user as owner
  INSERT INTO public.wedding_members (
    wedding_id,
    user_id,
    role
  ) VALUES (
    v_wedding_id,
    v_user_id,
    'owner'
  );
  
  RETURN v_wedding_id;
END;
$$;

-- ============================================
-- VERIFICATION
-- ============================================
-- Test fungsi dengan user yang sedang login
-- SELECT public.create_initial_wedding();

-- Check apakah fungsi sudah ter-update
-- SELECT routine_name, routine_type 
-- FROM information_schema.routines 
-- WHERE routine_name = 'create_initial_wedding';
