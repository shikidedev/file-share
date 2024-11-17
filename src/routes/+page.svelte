<script>
    import { supabase } from '$lib/supabaseClient';
    import Icon from '@iconify/svelte';
    import { v4 as uuidv4 } from 'uuid';

    let fileInput;
    let file;
    let fileName;
    let msg = "No file or invalid file";
    let downloadUrl = '';
    let expirationTime = 1;
    
    
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
            return;
        }
    
        const formData = new FormData();
        formData.append("file", file);  // Append the file (not base64)
        formData.append("fileName", fileName);  // Append the file name as a separate field
        formData.append("expiration", expirationTime);
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
            }

            const { data: signedUrl , error: signedUrlError } = await supabase
            .storage
            .from('uploads')
            .createSignedUrl(filePath, expirationTime * 60, {download: true} )
    
            // const json = await resp.json();
    
            // if (json.error) {
            //     throw new Error(json.error);
            // }
    
            if (data) {
                console.log(data)
            }
            downloadUrl = signedUrl.signedUrl;
            console.log(downloadUrl);

            const resp = await fetch("/upload", {
                method: "POST",
                body: formData,
            });

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
    </script>
    
    <div class="form">
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

        <div class="expiration-container">
            <div class="exp-label">
                <Icon icon="il:clock"/>
                <label for="expiration">
                    Expires in:
                </label>
            </div>
            <div class="exp-form">
                <select id="expiration" bind:value={expirationTime}>
                    <option value="1">1 minute</option>
                    <option value="2">2 minutes</option>
                    <option value="3">3 minutes</option>
                    <option value="4">4 minutes</option>
                    <option value="5">5 minutes</option>
                </select>
            </div>
            
        </div>

        <div class="url">
            <button on:click={buttonClick}>
                {#if downloadUrl}
                    Copy Link
                {:else}
                    Get Link
                {/if}
            </button>
        </div>
        
    </div>
    
    <style lang="scss">
    .form {
        font-family: 'Poppins';
        display: column;
        align-items: center;
        justify-content: center;
        border: 2px solid #e0e0e0;
        border-radius: 10px;
        padding: 0.5rem;
    }
    .title{
        display: flex;
        justify-content: center;
    }
    
    .url {
        display: flex;
        justify-self: center;
        margin: 0.5rem;
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
        .upload {
            padding: 0.5rem;
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

    .expiration-container {
        display: flex;
        gap: 0.5rem;
        justify-content: center;

        .exp-label {
            display: flex;
            align-items: center;
            gap: 0.5rem;

        }
    }
    </style>
    