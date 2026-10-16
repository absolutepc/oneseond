CREATE TABLE IF NOT EXISTS uploaded_photos (
 name TEXT PRIMARY KEY NOT NULL,
 content_type TEXT NOT NULL,
 size INTEGER NOT NULL,
 created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS uploaded_photo_chunks (
 photo_name TEXT NOT NULL REFERENCES uploaded_photos(name) ON DELETE CASCADE,
 part INTEGER NOT NULL,
 body TEXT NOT NULL,
 PRIMARY KEY (photo_name, part)
);
