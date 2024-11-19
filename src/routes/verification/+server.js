import pkg from 'bcrypt';
import { json } from '@sveltejs/kit';

const { compare } = pkg; 

export async function POST({ request }) {

    console.log('test');
        try{
            const form = await request.formData();
            const enteredPassword = form.get('enteredPassword');
            const correctPassword = form.get('correctPassword');
            console.log(correctPassword)

            const isMatch = await compare(enteredPassword,correctPassword);

            if (isMatch) {
                return json({ message: 'Correct password'}, { status: 200 });
            } else {
                return json({ message: 'Incorrect password'}, { status: 401});
            }

        } catch (error) {
            return json({ error: error.message }, { status: 500 });
        }
//     const { enteredPassword, hashedPassword } = await request.json();

//     try {
//         // Compare entered password with hashed password
//         const isMatch = await bcrypt.compare(enteredPassword, hashedPassword);

//         if (isMatch) {
//             return new Response(JSON.stringify({ success: true }), { status: 200 });
//         } else {
//             return new Response(JSON.stringify({ success: false, error: 'Incorrect password' }), { status: 401 });
//         }
//     } catch (error) {
//         return new Response(
//             JSON.stringify({ success: false, error: 'An error occurred during password verification.' }),
//             { status: 500 }
//         );
//     }
}
