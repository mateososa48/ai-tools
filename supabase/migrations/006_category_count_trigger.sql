-- Auto-update category tool_count when tools are added/removed

CREATE OR REPLACE FUNCTION update_category_tool_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE categories SET tool_count = tool_count + 1 WHERE id = NEW.category_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE categories SET tool_count = tool_count - 1 WHERE id = OLD.category_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_tool_category_count
AFTER INSERT OR DELETE ON tool_categories
FOR EACH ROW EXECUTE FUNCTION update_category_tool_count();
