import { supabase } from "$lib/supabaseServer";
import { json } from "@sveltejs/kit";

export async function POST() {
    try {
        // Fetch all expired rows from the file_metadata table
        const { data: expiredFiles, error: fetchError } = await supabase
            .from('file_metadata')
            .select('id, shortid')
            .lt('expiration_time', new Date().toISOString()); // Select files with expiration_time < now()

        if (fetchError) {
            return json({ error: fetchError.message }, { status: 500 });
        }

        // Iterate over the expired files and delete each one
        for (const file of expiredFiles) {
            // Fetch the file paths from the file_location table related to the same shortid
            const { data: fileLocations, error: fetchLocationError } = await supabase
                .from('file_location')
                .select('file_path')
                .eq('shortid', file.shortid);

            if (fetchLocationError) {
                console.error(`Failed to fetch file locations for shortid: ${file.shortid}`, fetchLocationError.message);
                continue; // Skip to the next file
            }

            // Delete the files from storage based on the file paths
            const filePaths = fileLocations.map(location => location.file_path);

            const { error: deleteFileError } = await supabase
                .storage
                .from('uploads') // Replace 'uploads' with your bucket name if different
                .remove(filePaths);

            if (deleteFileError) {
                console.error(`Failed to delete files for shortid: ${file.shortid}`, deleteFileError.message);
                continue; // Skip to the next file
            }

            // Delete all rows in the file_location table related to the expired shortid
            const { error: deleteLocationError } = await supabase
                .from('file_location')
                .delete()
                .eq('shortid', file.shortid);

            if (deleteLocationError) {
                console.error(`Failed to delete file_location for shortid: ${file.shortid}`, deleteLocationError.message);
                continue; // Skip to the next file
            }

            // Delete the metadata row from the file_metadata table
            const { error: deleteMetadataError } = await supabase
                .from('file_metadata')
                .delete()
                .eq('id', file.id);

            if (deleteMetadataError) {
                console.error(`Failed to delete metadata for file ID: ${file.id}`, deleteMetadataError.message);
                continue; // Skip to the next file
            }

            console.log(`Successfully deleted files, file_location rows, and metadata: shortid: ${file.shortid}, ID: ${file.id}`);
        }

        return json({ message: 'Expired files, file_locations, and metadata processed successfully' }, { status: 200 });
    } catch (error) {
        return json({ error: error.message }, { status: 500 });
    }
}
