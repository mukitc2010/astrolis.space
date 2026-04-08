/**
 * Applies cursor-based pagination to a Supabase query builder.
 *
 * @param {import('@supabase/supabase-js').PostgrestFilterBuilder} query - Supabase query builder
 * @param {string|null} cursor - ISO-8601 timestamp cursor (created_at of last item)
 * @param {number} limit - Maximum number of rows to return
 * @returns {Promise<{ data: any[], next_cursor: string|null }>}
 */
async function paginatedQuery(query, cursor, limit) {
  if (cursor) {
    query = query.lt('created_at', cursor);
  }

  query = query.order('created_at', { ascending: false }).limit(limit);

  const { data, error } = await query;

  if (error) throw error;

  const next_cursor =
    data.length === limit ? data[data.length - 1].created_at : null;

  return { data, next_cursor };
}

module.exports = { paginatedQuery };
