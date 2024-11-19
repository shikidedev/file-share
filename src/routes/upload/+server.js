import { supabase } from '$lib/supabaseServer';
import { json } from '@sveltejs/kit';
import pkg from 'bcrypt';

const { hash } = pkg;

export async function POST({ request }) {
    try {
       const formData = await request.formData();
       const file = formData.get('file');
       const expirationMinutes = parseInt(formData.get('expiration'), 10);
       const filePath = formData.get('filePath');
       const password = formData.get('password');
       const shortid = formData.get('shortid');

    //    if () {
    //     console.log("No password entered or password is empty");
    //     return json({ error: 'No password provided' }, { status: 400 });
    //     }

        

        console.log(formData.get('password'))

        let hashedPassword = null;
       
    //    const hashedPassword = password ? await  : null;
        if (!password || password.trim() === '') {
            hashedPassword = "null";
        } else {
            hashedPassword = await hash(password, 10)
        }

        if (!file) {
            return json({ error: 'No file uploaded' }, { status: 400 });
        }

        const expirationTimeInSeconds = expirationMinutes * 60;

        const { data: metadata, error: metadataError } = await supabase
            .from('file_metadata')
            .insert([
                {
                    file_path: filePath,
                    upload_time: new Date(),
                    expiration_time: new Date(Date.now() + expirationTimeInSeconds * 1000),
                    password: hashedPassword,
                    shortid: shortid,
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

