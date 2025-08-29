
-- Create policy for authenticated users to view files in the 'media' bucket.
CREATE POLICY "Allow authenticated users to view media"
ON storage.objects FOR SELECT
TO authenticated
USING ( bucket_id = 'media' );

-- Create policy for service_role to have full access to the 'media' bucket.
-- This allows our backend server actions to upload, update, and delete files.
CREATE POLICY "Allow service_role full access to media"
ON storage.objects FOR ALL
TO service_role
USING ( bucket_id = 'media' );
