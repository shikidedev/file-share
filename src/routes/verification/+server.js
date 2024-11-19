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
}
