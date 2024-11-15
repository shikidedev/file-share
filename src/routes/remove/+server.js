import { supabase } from "$lib/supabaseClient";
import { json } from "@sveltejs/kit";

export async function POST() {
    try {
        // Fetch all expired rows from the file_metadata table
        const { data: expiredFiles, error: fetchError } = await supabase
            .from('file_metadata')
            .select('id, file_path')
            .lt('expiration_time', new Date().toISOString()); // Select files with expiration_time < now()

        if (fetchError) {
            return json({ error: fetchError.message }, { status: 500 });
        }

        // Iterate over the expired files and delete each one
        for (const file of expiredFiles) {
            // Delete the file from storage
            const { error: deleteFileError } = await supabase
                .storage
                .from('uploads') // Replace 'uploads' with your bucket name if different
                .remove([file.file_path]);

            if (deleteFileError) {
                console.error(`Failed to delete file: ${file.file_path}`, deleteFileError.message);
                continue; // Skip to the next file
            }

            // Delete the metadata row
            const { error: deleteMetadataError } = await supabase
                .from('file_metadata')
                .delete()
                .eq('id', file.id);

            if (deleteMetadataError) {
                console.error(`Failed to delete metadata for file ID: ${file.id}`, deleteMetadataError.message);
                continue; // Skip to the next file
            }

            console.log(`Successfully deleted file and metadata: ${file.file_path}, ID: ${file.id}`);
        }

        return json({ message: 'Expired files and metadata processed successfully' }, { status: 200 });
    } catch (error) {
        return json({ error: error.message }, { status: 500 });
    }
}
