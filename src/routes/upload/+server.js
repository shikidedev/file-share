import { supabase } from '$lib/supabaseClient';
import { json } from '@sveltejs/kit';
import { v4 as uuidv4 } from 'uuid';

export async function POST({ request }) {
    console.log('test');
    try {
       const formData = await request.formData();
       const file = formData.get('file');
       const fileName = formData.get('fileName');
       const expirationMinutes = parseInt(formData.get('expiration'), 10);


        if (!file) {
            return json({ error: 'No file uploaded' }, { status: 400 });
        }

        const expirationTimeInSeconds = expirationMinutes * 60;

        const uniqueFileName = `${uuidv4()}-${fileName}`;
        const filePath = `uploads/${uniqueFileName}`;
        //upload
        const { data, error } = await supabase
            .storage
            .from('uploads')
            .upload(filePath, file, { upsert: true })
        
        console.log(data);
        
        if (error) {
            console.log(error);
        }
        //get link
        
        const { data: signedUrl , error: signedUrlError } = await supabase
            .storage
            .from('uploads')
            .createSignedUrl(filePath, expirationTimeInSeconds, {download: true} )
            
        console.log(signedUrl);

        if (signedUrlError) {
            return json({ error: signedUrlError.message }, { status: 500 });
        }

        const { data: metadata, error: metadataError } = await supabase
            .from('file_metadata')
            .insert([
                {
                    file_path: filePath,
                    upload_time: new Date(),
                    expiration_time: new Date(Date.now() + expirationTimeInSeconds * 1000),
                }
            ]);
        
        if (metadataError) {
            return json({ error: metadataError.message }, { status: 500 })
        }

        console.log(metadata);

        return json({ message: 'File uploaded successfully', url: signedUrl }, { status: 200 });

    } catch (error) {
        return json({ error: error.message }, { status: 500 });
    }
    }

