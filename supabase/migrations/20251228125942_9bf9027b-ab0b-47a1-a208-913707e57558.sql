-- Update handle_new_user function with input validation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  username_value TEXT;
BEGIN
  -- Extract and validate username
  username_value := new.raw_user_meta_data ->> 'username';
  
  -- Validate: trim, length check, character validation
  IF username_value IS NOT NULL THEN
    username_value := TRIM(username_value);
    
    -- Enforce length limit (3-30 chars)
    IF LENGTH(username_value) < 3 OR LENGTH(username_value) > 30 THEN
      username_value := NULL;
    END IF;
    
    -- Validate characters (alphanumeric, underscore, hyphen only)
    IF username_value IS NOT NULL AND username_value !~ '^[a-zA-Z0-9_-]+$' THEN
      username_value := NULL;
    END IF;
  END IF;
  
  -- Use email prefix as fallback (truncated to 30 chars)
  IF username_value IS NULL OR username_value = '' THEN
    username_value := LEFT(SPLIT_PART(new.email, '@', 1), 30);
  END IF;
  
  INSERT INTO public.profiles (user_id, username)
  VALUES (new.id, username_value);
  
  RETURN new;
END;
$$;