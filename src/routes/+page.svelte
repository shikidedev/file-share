<script>
    import { supabase } from '$lib/supabaseClient';
    import Icon from '@iconify/svelte';
    import { v4 as uuidv4 } from 'uuid';
    import { customAlphabet } from 'nanoid';
    
    let showPassword = false;
    let fileInput;
    let file;
    let fileName;
    let password = "";
    let downloadUrl = '';
    let expirationTime = 7200; 
    let errorMsg = '';
    let uploadStatus = '';
 
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
        const uploadedFile = event.target.files[0];
        if (uploadedFile) {
            file = uploadedFile;
            fileName = uploadedFile.name;
        }
    }
    
    function handleDrop(e) {
        e.preventDefault();
        const uploadedFile = e.dataTransfer.files[0];
        if (uploadedFile) {
            file = uploadedFile;
            fileName = uploadedFile.name;
        }
    }
    
    async function downloadLink() {
        if (!file) {
            console.log("No file uploaded");
            errorMsg = "No file entered"
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
        formData.append("file", file);  // Append the file (not base64)
        formData.append("fileName", fileName);  // Append the file name as a separate field
        formData.append("expiration", expirationTime);
        formData.append('password', password);
        formData.append('shortid',shortId);
        const uniqueFileName = `${uuidv4()}-${fileName}`;

        const filePath = `uploads/${uniqueFileName}`;
        formData.append("filePath", filePath);

        try {
            

            const { data, error } = await supabase
                .storage
                .from('uploads')
                .upload(filePath, file, { upsert: true })
    
            if (error) {
                console.log(error);
                uploadStatus='File upload failed'
                return;
            }

            uploadStatus= 'File Uploaded!'
    
            if (data) {
                console.log(data);
            }
            const baseUrl = window.location.href;

            downloadUrl = `${baseUrl}${shortId}`;
            
            console.log(downloadUrl);

            const resp = await fetch("/upload", {
                method: "POST",
                body: formData,
            });

            console.log(resp)

            if (!resp) {
                throw new Error(`Metadata insertion failed`);
            }
        } catch (error) {
            console.log(error);
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
        file = null;
        fileName = '';
        password = '';
        downloadUrl = '';
        errorMsg = '';
        showPassword = false;
        expirationTime = 7200;
        uploadStatus = '';
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
                {#if fileName}
                    <div class="file-name">Uploaded File: {fileName}</div>
                {/if}
                <span> Choose a file or drag it here</span>
                <button
                    on:click={(e) => {
                        fileInput.click();
                    }}>Browse File</button>
            </div>
    
            <input
                type="file"
                bind:this={fileInput}
                id="file"
                style="display: none"
                required
                on:change={handleFileUpload} />
        </div>

        <div class="toggle-password">
            
            <label for="showPassword">
                <input type="checkbox" id="showPassword" bind:checked={showPassword}>
                Enable password protection for your file<link rel="stylesheet" href="">
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

        {#if uploadStatus==='File Uploaded!'}
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
    