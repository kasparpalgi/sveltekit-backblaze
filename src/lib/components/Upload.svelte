<script>
	import { calculateSHA1 } from '$lib/utils/hashing.js';
	import { bucketName, backblazeUrl, maxUploadSizeMb } from '$lib/config/backblaze-upload';

	/** @type {HTMLInputElement | null} */
	let fileInput;
	let imageSHA1 = '';
	/** @type {Blob} */
	let imageFile;
	let errorMessage = '';
	let submitState = '';
	let uploadedUrl = '';

	// Handles the event when a file is chosen by the user
	async function handleFileChange(event) {
		imageFile = event.target.files[0];

		// Ensure that the file size is not more than allowed
		if (imageFile.size > maxUploadSizeMb * 1024 * 1024) {
			errorMessage = 'Uploaded image size must not exceed' + maxUploadSizeMb + 'MB!';
			setTimeout(() => {
				errorMessage = '';
			}, 3000);
			imageFile = null;
			return;
		}

		try {
			submitState = 'processing';
			// Calculate the SHA1 hash of the image file in the front-end side
			imageSHA1 = await calculateSHA1(imageFile);
			const formData = new FormData();
			formData.append('imageFile', imageFile);
			formData.append('imageSHA1', imageSHA1);

			// Send the image and related data to the SvelteKit API endpoint
			const response = await fetch('/api/upload', {
				method: 'POST',
				body: formData
			});

			const uploadedFileName = await response.text();

			if (response.status === 200) {
				submitState = 'success';
				uploadedUrl = backblazeUrl + '/file/' + bucketName + '/' + uploadedFileName; // TODO: do something with this URL now
			} else {
				errorMessage = 'Error occurred while uploading the image. Please try again!';
			}
			setTimeout(() => {
				submitState = 'complete';
			}, 4000);
		} catch (err) {
			// Log the error and update the errorMessage
			console.error('Error:', err.message);
			errorMessage = 'Error occurred while uploading the image. Please try again!';
		}
	}

	// Opens the file dialog when the upload icon is clicked
	function handleImageClick() {
		if (fileInput) fileInput.click();
	}
</script>

<p class="flex items-center text-lg font-semibold">
	Photo:
	<input
		type="file"
		class="hidden"
		bind:this={fileInput}
		on:change={handleFileChange}
		accept="image/*"
	/>
	<button on:click={handleImageClick}>
		<img class="mb-1 ml-2" src="https://i.imgur.com/RW3iFyI.png" alt="Upload" /></button
	>{#if imageFile && (submitState === '' || submitState === 'processing')}
		&nbsp;{imageFile.name}
	{/if}
</p>

{#if errorMessage}
	{errorMessage}
{/if}

{#if submitState === 'success'}
	Image has been uploaded!
{/if}

{#if submitState === 'processing'}
	Uploading image…
{/if}

<style>
	.hidden {
		display: none;
	}
</style>
