import { supabase } from '$lib/supabaseServer';

export async function load({ params }) {
    const { shortid } = params;

    // Fetch file data from database
    const { data, error } = await supabase
        .from('file_metadata') // Replace with your table name
        .select("*") // Fetch necessary fields
        .eq('shortid', shortid)
        .single();

    if (error || !data) {
        return {
            status: 404,
            error: new Error('File not found'),
        };
    }

    return {
        data,
        // hasPassword: !!data.password, // Check if a password exists
        // hashedPassword: data.password, // Pass the hashed password if it exists
    };
}
