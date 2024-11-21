<script>
    import { supabase } from '$lib/supabaseClient';
    import Icon from '@iconify/svelte';
    import { v4 as uuidv4 } from 'uuid';
    import { customAlphabet } from 'nanoid';
    
    let showPassword = false;
    let fileInput;
    let files = [];
    let fileNames = [];
    let password = "";
    let downloadUrl = '';
    let expirationTime = 7200; 
    let errorMsg = '';
    let uploadStatus = '';
    let title = '';
    let description = '';
 
    const expirationOptions = [
    { value: 60, label: "1 hour" },
    { value: 720, label: "12 hours" },
    { value: 1440, label: "1 day" },
    { value: 2880, label: "2 days" },
    { value: 7200, label: "5 days" },
    { value: 10080, label: "7 days" }
    ];

    function convertBlobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                resolve(reader.result);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }
    
    async function handleFileUpload(event) {
        const uploadedFiles = Array.from(event.target.files); // Convert FileList to Array
         if (uploadedFiles.length > 0) {
        files = [...files, ...uploadedFiles]; // Add new files to the existing array
        fileNames = files.map(file => file.name); // Update file names array
    }
    }
    
    function handleDrop(e) {
        e.preventDefault();
        const uploadedFiles = Array.from(e.dataTransfer.files); // Convert FileList to Array
        if (uploadedFiles.length > 0) {
        files = [...files, ...uploadedFiles]; // Add new files to the existing array
        fileNames = files.map(file => file.name); // Update file names array
    }
    }
    
    async function downloadLink() {
        if (files.length === 0) {
            console.log("No file uploaded");
            errorMsg = "No files entered"
            return;
        }

        uploadStatus = 'Uploading file...'

        console.log('test1');
        console.log(password)

        errorMsg = '';
        

        const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        const nanoid = customAlphabet(alphabet, 8);
        const shortId = nanoid();

        const formData = new FormData();
        // formData.append("file", file);  // Append the file (not base64)
        // formData.append("fileName", fileName);  // Append the file name as a separate field
        formData.append("expiration", expirationTime);
        formData.append('password', password);
        formData.append('shortid',shortId);
        formData.append('title', title);
        formData.append('description', description);
        // const uniqueFileName = `${uuidv4()}-${fileName}`;

        // const filePath = `uploads/${uniqueFileName}`;
        // formData.append("filePath", filePath);

        try {

            const resp = await fetch("/upload", {
                    method: "POST",
                    body: formData,
            });
            for (const file of files) {
                const uniqueFileName = `${uuidv4()}-${file.name}`;
                const filePath = `uploads/${uniqueFileName}`;

                const formData_location = new FormData();
                formData_location.append('file_path', filePath);
                formData_location.append('shortid',shortId);
                formData_location.append('fileName', file.name);
                

                const { data, error } = await supabase
                .storage
                .from('uploads')
                .upload(filePath, file, { upsert: true })
    
                if (error) {
                    console.log(error);
                    uploadStatus='File upload failed'
                    return;
                }

                const resp = await fetch("/upload", {
                    method: "POST",
                    body: formData_location,
                });
            }

            const baseUrl = window.location.href;

            downloadUrl = `${baseUrl}${shortId}`;

            uploadStatus = 'File uploaded!';


            
            console.log(downloadUrl);
        } catch (error) {
            console.log(error);
            uploadStatus = 'File upload failed'
        }
    }

    async function copyToClipboard() {
        try {
            await navigator.clipboard.writeText(downloadUrl);
            console.log("Copied to clipboard:", downloadUrl);
        } catch (error) {
            console.error("Failed to copu to clipboard:", error);
        }
    }

    async function buttonClick() {
        if (!downloadUrl) {
            await downloadLink(); // Generate the link
        } else {
            await copyToClipboard(); // Copy the link
        }
    }

    function clearError() {
        errorMsg = '';
    }

    function resetForm() {
         setTimeout(() => {
            location.reload();
        }, 1000);
    }

    function removeFile(index) {
    files = files.filter((_, i) => i !== index); // Create a new array excluding the file at the given index
    fileNames = files.map(file => file.name); // Update the file names array
    }

    </script>
    
    <div class="form">
        {#if errorMsg}
        <button class="error-issue" on:click={clearError}>
            {errorMsg}
        </button>
        {/if}

        {#if uploadStatus === 'Uploading file...'}
            <div class="loading">
                {uploadStatus}
            </div>
        {:else if uploadStatus==='File upload failed'}
            <div class="failed">
                {uploadStatus}
            </div>
        {:else if uploadStatus==='File uploaded!'}
            <div class="success">
                {uploadStatus}
            </div>
        {/if}
        <div class="title">
            <h1>Upload Form</h1>
        </div>
        <div class="upload-container">
            <div
                class="upload"
                on:drop={handleDrop}
                on:dragover={(e) => e.preventDefault()}>
                <span> Choose files or drag them here</span>
                <button
                    on:click={(e) => {
                        fileInput.click();
                    }}>Browse File</button>
            </div>
    
            <input
                multiple
                type="file"
                bind:this={fileInput}
                id="file"
                style="display: none"
                required
                on:change={handleFileUpload} />
        </div>

        {#if files.length > 0}
                <div class="file-list">
                    <h4>Uploaded Files:</h4>
                    
                        {#each files as file, index}
                            <div class="file-field">
                                <div class="file-display">
                                    {file.name}
                                </div>
                                <button class="remove" on:click={() => removeFile(index)}>
                                    Remove
                                </button>
                            </div>
                            
                        {/each}
                    
                </div>
        {/if}

        <div class="details">
            <p>Details (Optional)</p>
            <div class="title-field">
                <label for="title-field">Title:</label>
                <input type="text" id="title" bind:value={title}>
            </div>
    
            <div class="description-field">
                <label for="description-field">Description:</label>
                <textarea name="description" bind:value={description} id="description"></textarea>
            </div>
        </div>

        <div class="toggle-password">
            
            <label for="showPassword">
                Enable password protection for your file<link rel="stylesheet" href="">
                <input type="checkbox" id="showPassword" bind:checked={showPassword}>
            </label>
        </div>

        {#if showPassword}
            <div class="password-field">
                <label for="Password">Password</label>
                <input type="password"
                    bind:value={password}
                    placeholder="Enter a password">
            </div>
        {/if}
        
        <div class="expiration-container">
            <div class="exp-label">
                <Icon icon="il:clock"/>
                <label for="expiration">
                    Expires in:
                </label>
            </div>
            <div class="exp-form">
                <!-- 1 hour = 1 min * 60 -->
                <select id="expiration" bind:value={expirationTime}>
                    {#each expirationOptions as { value, label }}
                        <option value={value}>{label}</option>
                    {/each}
                </select>
            </div>
            
            
            
            
        </div>

        <div class="url">
            <div class="url-label">
                {#if downloadUrl}
                <p style="color: #82868F">Press to copy your link:</p>
            {/if}
            </div>
            
            <button on:click={buttonClick}>
                {#if downloadUrl}
                    {downloadUrl}
                {:else}
                    Get Link
                {/if}
            </button>
        </div>

        {#if uploadStatus==='File uploaded!'}
            <div class="reset" on:click={resetForm}>
                    Convert Next File
            </div>
        {/if}
       
        
    </div>
    
    <style lang="scss">
    .form {
        font-family: 'Poppins';
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

        .file-list {
            padding: 0.5rem;
            gap: 0.5rem;
            display: flex;
            flex-direction: column;

            .file-field {
                display: flex;
                justify-content: space-between;
                gap: 0.5rem;
            }
            .file-display {
            display: inline;
            justify-content: space-between;
            padding: 0.5rem;
            gap: 0.5rem;
            border: 1px solid #e0e0e0;
            border-radius: 5px;
        }
        }
        .details {
        display: flex;
        border: 1px solid #e0e0e0;
        flex-direction: column;
        padding: 1rem; /* Slightly increased padding for better spacing */
        gap: 1rem; /* Increased gap between form elements */
        justify-content: flex-start;
        border-radius: 5px;
    }

    /* Styling for individual fields like title and description */
    .title-field, .description-field {
        display: flex;
        flex-direction: column;
        gap: 0.5rem; /* Adds space between label and input */
    }

    /* Label styling */
    .toggle-password label {
        font-size: 1rem;
        font-weight: 600;
        color: #333;
    }

    /* Input field styling */
    input[type="text"] {
        padding: 0.75rem;
        font-size: 1rem;
        border: 1px solid #ccc;
        border-radius: 5px;
        outline: none;
        transition: border-color 0.3s ease;
    }

    /* Focus effect for input fields */
    input[type="text"]:focus {
        border-color: #007bff;
    }

    .details {
        max-width: 500px;
        margin: 0 auto;
    }


    .error-issue {
        font-family: 'Poppins';
        border: 0px;
        background-color: #e9686a;
        color: #f4f6f6;
        border-radius: 5px;
        padding: 0.5rem;
        cursor: pointer;
    }

    button.error-issue:hover{
            background-color: #e75254;
        }

    .loading .failed .success{
        padding:0.5rem;
        cursor: pointer;
        border-radius: 0.5rem;

        .loading {
        background-color: #c9d2da;
        color:#344856; 
        border: solid 1px #344856;
    }

        .failed {
            background-color: #e9686a;
            color: #f4f6f6;
        }

        .success {
            background-color: #38ae48;
            color: #f4f6f6;
        }
    }

    .title{
        display: flex;
        justify-content: center;
        margin-bottom: 1rem;

        h1 {
            font-size: 1.8rem;
            color: #344856;
        }
    }


    
    .url {
        display: flex;
        justify-self: center;
        margin: 0.5rem;
        flex-direction: column;
    }
    
    button {
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
    .upload-container {
        display: flex;
        justify-content: center;
        margin-bottom: 1rem;
        .upload {
            padding: 1rem;
            cursor: default;
            display: flex;
            flex-direction: column;
            width: min(100%, 450px);
            aspect-ratio: 3 /2;
            margin-inline: auto;
            border: 2px dashed #82868F;
            border-radius: 1rem;
            gap: 1rem;
            background-color: #f4f6f6;
            display: flex;
            align-items: center;
            justify-content: center;
            span {
                color: #344856;
            }
        }
    }



    .reset {
        background-color: white;
        color: #4b80e3;
        border: 2px solid #4b80e3;
        border-radius: 5px;
        padding: 0.5rem;
        cursor: pointer;
        
        &:hover {
            background-color: rgb(216, 197, 197);
            color: #3673e4;
        }
    }

    .toggle-password {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-top: 1rem;
        font-size: 1rem;

        label {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            cursor: pointer;
        }

        input[type="checkbox"] {
            transform: scale(1.2); /* Make the checkbox larger */
            cursor: pointer;
        }

        input::placeholder {
            font-family: 'Poppins';
        }
    }

    .password-field {
        border: 1px solid #e0e0e0;
        border-radius: 5px;
        margin-top: 0.5rem;
        display: inline;
        flex-direction: row;
        align-items: flex-start;
        gap: 0.5rem;
        justify-content: center;
        padding: 0.5rem;
    }

    .expiration-container {
        border: 1px solid #e0e0e0;
        border-radius: 5px;
        margin-top: 0.5rem;
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        gap: 0.5rem;
        justify-content: center;
        padding: 0.5rem;

        .exp-label {
            display: flex;
            align-items: center;
            gap: 0.5rem;

        }
    }

    
    </style>
    