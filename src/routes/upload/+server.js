import { supabase } from '$lib/supabaseServer';
import { json } from '@sveltejs/kit';
import pkg from 'bcrypt';

const { hash } = pkg;

export async function POST({ request }) {
    try {
        const formData = await request.formData();
        const expirationMinutes = parseInt(formData.get('expiration'), 10);
        const filePath = formData.get('file_path');
        const password = formData.get('password');
        const shortid = formData.get('shortid');
        const title = formData.get('title');
        const description = formData.get('description');
        const fileName = formData.get('fileName');

        // Initialize password as null (hashedPassword will be null if no password is provided)
        let hashedPassword = null;

        if (password && password.trim() !== '') {
            hashedPassword = await hash(password, 10);  // Hash the password if it's provided
        }

        // Convert expiration time to seconds
        const expirationTimeInSeconds = expirationMinutes * 60;

        // Insert file metadata into Supabase
        const { data: metadataData, error: metadataError } = await supabase
            .from('file_metadata')
            .insert([
                {
                    upload_time: new Date(),
                    expiration_time: new Date(Date.now() + expirationTimeInSeconds * 1000),
                    password: hashedPassword,
                    shortid: shortid,
                    title: title,
                    description: description,
                }
            ]);

        if (metadataError) {
            console.error("Error inserting metadata:", metadataError);
        } else {
            console.log("Metadata inserted:", metadataData);
        }

        // Insert file location into Supabase
        const { data: locationData, error: locationError } = await supabase
            .from('file_location')
            .insert([
                {
                    file_path: filePath,
                    shortid: shortid,
                    fileName: fileName,
                }
            ]);

        if (locationError) {
            console.error("Error inserting file location:", locationError);
        } else {
            console.log("File location inserted:", locationData);
        }

    //    const formData = await request.formData();
    //    const file = formData.get('file');
    //    const expirationMinutes = parseInt(formData.get('expiration'), 10);
    //    const filePath = formData.get('filePath');
    //    const password = formData.get('password');
    //    const shortid = formData.get('shortid');
    //    const title = formData.get('title');
    //    const description = formData.get('description');

        

        // console.log(formData.get('password'))

        // let hashedPassword = null;
       
    //    const hashedPassword = password ? await  : null;
    //     if (!password || password.trim() === '') {
    //         hashedPassword = "null";
    //     } else {
    //         hashedPassword = await hash(password, 10)
    //     }

    //     if (!file) {
    //         return json({ error: 'No file uploaded' }, { status: 400 });
    //     }

    //     const expirationTimeInSeconds = expirationMinutes * 60;


        // const { data: metadata, error: metadataError } = await supabase
        //     .from('file_metadata')
        //     .insert([
        //         {
        //             file_path: filePath,
        //             upload_time: new Date(),
        //             expiration_time: new Date(Date.now() + expirationTimeInSeconds * 1000),
        //             password: hashedPassword,
        //             shortid: shortid,
        //             title: title,
        //             description: description,
        //         }
        //     ]);
        
    //     if (metadataError) {
    //         return json({ error: metadataError.message }, { status: 500 })
    //     }

    //     console.log(metadata);

    //     return json({ message: 'File uploaded successfully', url: signedUrl }, { status: 200 });

    } catch (error) {
        return json({ error: error.message }, { status: 500 });
    }
    }

