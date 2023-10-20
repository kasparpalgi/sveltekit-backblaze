import { getBackblazeDetails, getBucketId, getUploadUrl, uploadFile } from '$lib/server/backblaze';
import { bucketName } from '$lib/config/backblaze-upload';
import { generateRandomString } from '$lib/utils/randomStringGeneration';

export async function POST(event) {
    try {
        const data = await event.request.formData();
        const imageFile = data.get('imageFile');
        const imageSHA1 = data.get('imageSHA1');

        const { apiUrl, authorizationToken, accountId } = await getBackblazeDetails();
        const bucketId = await getBucketId(apiUrl, authorizationToken, accountId, bucketName);
        const { uploadUrl, uploadAuthToken } = await getUploadUrl(apiUrl, authorizationToken, bucketId);

        const generateFilename = generateRandomString(30); // Set whatever file name you wish or use the original file name the file had. I generate here a 30 characters random string for the file name.
        const fileName = generateFilename.replace(/[^a-z0-9]/gi, '_').toLowerCase(); // Make the filename URL/filename friendly if it isn't just generated random string.
        const fileSize = imageFile.size;

        await uploadFile(uploadUrl, uploadAuthToken, imageFile, fileName, fileSize, imageSHA1);

        // Return the filename that was uploaded in case of success
        return new Response(fileName, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.log('Server Error: ', error);
        return {
            status: 500,
            body: {
                success: false,
                message: 'Internal Server Error',
                error: error.message
            }
        };
    }
};
