-- BasedPaws Database Schema for Supabase
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- Photos table
CREATE TABLE IF NOT EXISTS photos (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    cid TEXT,
    image_url TEXT,
    owner_address TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    votes INTEGER DEFAULT 0,
    donations DECIMAL(18, 8) DEFAULT 0,
    quality_score DECIMAL(3, 2) DEFAULT 0.5
);

-- Votes table (tracks who voted for what)
CREATE TABLE IF NOT EXISTS votes (
    id SERIAL PRIMARY KEY,
    photo_id TEXT NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
    voter_address TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(photo_id, voter_address)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_photos_owner ON photos(owner_address);
CREATE INDEX IF NOT EXISTS idx_photos_created ON photos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_photos_votes ON photos(votes DESC);
CREATE INDEX IF NOT EXISTS idx_votes_photo ON votes(photo_id);
CREATE INDEX IF NOT EXISTS idx_votes_voter ON votes(voter_address);

-- Enable Row Level Security (RLS)
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Policies: Allow anyone to read (public gallery)
CREATE POLICY "Anyone can read photos" ON photos FOR SELECT USING (true);
CREATE POLICY "Anyone can read votes" ON votes FOR SELECT USING (true);

-- Policies: Allow anyone to insert (uploading photos, voting)
CREATE POLICY "Anyone can insert photos" ON photos FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can insert votes" ON votes FOR INSERT WITH CHECK (true);

-- Policies: Allow updates (for vote counts and donations)
CREATE POLICY "Anyone can update photos" ON photos FOR UPDATE USING (true);

-- Policies: Allow vote deletion (unvoting)
CREATE POLICY "Anyone can delete their votes" ON votes FOR DELETE USING (true);

-- Enable realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE photos;
ALTER PUBLICATION supabase_realtime ADD TABLE votes;
