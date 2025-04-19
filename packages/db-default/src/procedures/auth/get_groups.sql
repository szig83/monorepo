-- Active: 1743449447515@@localhost@5432@nextstarter@auth
CREATE OR REPLACE FUNCTION auth.get_groups(i_id INTEGER)
RETURNS TABLE (
  id INTEGER,
  name JSONB,
  description JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.name, u.description, u.created_at, u.updated_at
  FROM groups u
  WHERE u.id = i_id OR i_id IS NULL;
END;
$$ LANGUAGE plpgsql;
