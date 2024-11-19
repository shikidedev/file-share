<script>
    import { supabase } from '$lib/supabaseClient';
    export let data;
    // export let hasPassword;
    // export let hashedPassword;

    console.log(data)
    console.log(data.data.file_path)
    // console.log(hasPassword)
    // console.log(hashedPassword)
    const filePath = data.data.file_path
    const uploadTime = new Date(data.data.upload_time);
    const expirationTime = new Date(data.data.expiration_time)
    const duration = Math.floor((expirationTime - uploadTime) / 1000);
    let enteredPassword = "";
    let noPassword = data.data.password === "null";
    let verify = "false";
    let isCorrect = '';
    // let errorMessage = "";
    // let showDownloadButton = false;

    console.log(data.data.password);
    console.log(verify)

    async function getDownloadLink() {
        const { data: signedUrl } = await supabase.storage
        .from('uploads')
        .createSignedUrl(filePath,duration,{download: true, });

        console.log(signedUrl.signedUrl);

        window.location.href = signedUrl.signedUrl;

        // Refresh the page after download
        setTimeout(() => {
            location.reload();
        }, 1000);
    }

    function test() {
        if (data.data.password != "null") {
        console.log("have password")
    } else {
        console.log("no password")
    }
    }

    async function verifyPassword() {
        try {
            const form = new FormData();
            form.append('enteredPassword', enteredPassword);
            form.append('correctPassword', data.data.password);
            console.log(form)

            const resp = await fetch('/verification', {
                method: "POST",
                body: form,
            })

            if (resp.ok) {
            const responseBody = await resp.json();
            console.log('Password verified:', responseBody);

            // Update `verify` reactively
            if (responseBody.message === 'Correct password') {
                verify = "true";
                isCorrect = "true";
            } else {
                verify = "false";
                isCorrect = "false";
            }
        } else {
            const errorResponse = await resp.json();
            console.error('Verification failed:', errorResponse.error);
            verify = "false";
            isCorrect = "false";
        }
            
        } catch (error) {
            console.error("Verification error:", error);
        }
    }
</script>

<div class="url-download">
    {#if isCorrect === 'true'}
        <div class="correct">
            Correct Password!
        </div>
    {:else if isCorrect === 'false'}
        <div class="incorrect">
            Incorrect password please try again!
        </div>
    {/if}
    
    {#if noPassword || verify === "true"}
        <p>Download File</p>
        <button on:click={getDownloadLink}>
            Download
        </button>
    {:else}
        <div class="password-field">
            <p>Enter password to download file</p>
            <label for="password">Password:</label>
            <input type="password" bind:value={enteredPassword}>
        </div>
        <button on:click={verifyPassword}>Enter</button>
    {/if}
   

    
</div>


<style>
    div {
        font-family: 'Poppins';
    }

    .incorrect{
        display: flex;
        background-color: #e9686a;
        color: #f4f6f6;
        padding: 0.5rem;
        border-radius: 0.5rem;
        border: 0px;
    }

    .url-download{
        display: flex; /* Changed from `column` */
        flex-direction: column; /* Added to stack elements vertically */
        align-items: center; 
        justify-content: center;
        border: 2px solid #e0e0e0;
        border-radius: 10px;
        padding: 1.5rem; /* Increased padding for better spacing */
        max-width: 500px; /* Set a max width */
        margin: auto; /* Center the form horizontally */
    }

    button {
        margin: 0.5rem;
        font-family: 'Poppins';
        border: 0px;
        background-color: #538DFC;
        color: #f4f6f6;
        border-radius: 5px;
        padding: 0.5rem;
    }
    button:hover {
        cursor: pointer;
        background-color: #4b80e3;
    }
</style>
