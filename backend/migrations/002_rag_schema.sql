CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS theory_documents (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename    TEXT NOT NULL UNIQUE,
    title       TEXT,
    total_pages INT,
    indexed_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS theory_chunks (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES theory_documents(id) ON DELETE CASCADE,
    page_number INT NOT NULL,
    chunk_index INT NOT NULL DEFAULT 0,
    content     TEXT NOT NULL,
    embedding   VECTOR(1536),
    token_count INT,
    created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS theory_chunks_embedding_idx
    ON theory_chunks USING hnsw (embedding vector_cosine_ops);

CREATE OR REPLACE FUNCTION match_theory_chunks(
    query_embedding VECTOR(1536),
    match_count INT DEFAULT 5
) RETURNS TABLE (
    id UUID,
    content TEXT,
    page_number INT,
    document_title TEXT,
    document_filename TEXT,
    similarity FLOAT
) LANGUAGE sql STABLE AS $$
    SELECT
        c.id,
        c.content,
        c.page_number,
        d.title AS document_title,
        d.filename AS document_filename,
        1 - (c.embedding <=> query_embedding) AS similarity
    FROM theory_chunks c
    JOIN theory_documents d ON d.id = c.document_id
    ORDER BY c.embedding <=> query_embedding
    LIMIT match_count;
$$;
