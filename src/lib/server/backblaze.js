import axios from 'axios';
import { BACKBLAZE_API_KEY, BACKBLAZE_API_SECRET, authorize_url } from '$lib/config/backblaze-upload';

export async function getBackblazeDetails() {
    try {
        const encodedCredentials = Buffer.from(BACKBLAZE_API_KEY + ':' + BACKBLAZE_API_SECRET).toString(
            'base64'
        );
        const response = await axios.get(authorize_url, {
            headers: {
                Authorization: `Basic ${encodedCredentials}`
            }
        });

        if (response.status === 200) {
            return {
                apiUrl: response.data.apiUrl,
                authorizationToken: response.data.authorizationToken,
                accountId: response.data.accountId
            };
        } else {
            throw new Error(`Authorization failed with status: ${response.status}`);
        }
    } catch (error) {
        throw new Error(`Authorization failed with error: ${error}`);
    }
}

/** @param {string} apiUrl @param {string} authorizationToken @param {string} accountId  @param {string} bucketName @throws {Error} */
export async function getBucketId(apiUrl, authorizationToken, accountId, bucketName) {
    try {
        const response = await axios.post(
            `${apiUrl}/b2api/v2/b2_list_buckets`,
            {
                accountId: accountId
            },
            {
                headers: {
                    Authorization: authorizationToken
                }
            }
        );

        if (response.status === 200) {
            // @ts-ignore
            const bucket = response.data.buckets.find((bucket) => bucket.bucketName === bucketName);
            if (bucket) {
                return bucket.bucketId;
            } else {
                throw new Error(`Bucket not found: ${bucketName}`);
            }
        } else {
            throw new Error(`Failed to get Bucket ID with status: ${response.status}`);
        }
    } catch (error) {
        throw new Error(`Failed to get Bucket ID with error: ${error}`);
    }
}


/** @param {string} apiUrl @param {string} authorizationToken @param {string} bucketId @throws {Error} */
export async function getUploadUrl(apiUrl, authorizationToken, bucketId) {
    try {
        const response = await axios.post(
            `${apiUrl}/b2api/v2/b2_get_upload_url`,
            {
                bucketId: bucketId
            },
            {
                headers: {
                    Authorization: authorizationToken
                }
            }
        );
        //console.log(`Response data: ${JSON.stringify(response.data)}`);

        if (response.status === 200) {
            return {
                uploadUrl: response.data.uploadUrl,
                uploadAuthToken: response.data.authorizationToken
            };
        } else {
            console.log(`Failed to get upload URL with status: ${response.status}`);
            throw new Error(`Failed to get upload URL with status: ${response.status}`);
        }
    } catch (error) {
        // @ts-ignore
        console.log(`Error Response: ${JSON.stringify(error.response.data)}`);
        throw new Error(`Failed to get upload URL with error: ${error}`);
    }
}


/** @param {string} uploadUrl @param {string} uploadAuthToken @param {Blob} file @param {string} fileName @param {number} fileSize @param {string} imageSHA1 @throws {Error} */
export async function uploadFile(uploadUrl, uploadAuthToken, file, fileName, fileSize, imageSHA1) {
    try {
        const blob = await file.arrayBuffer();
        const headers = {
            Authorization: uploadAuthToken,
            'X-Bz-File-Name': fileName,
            'Content-Length': fileSize.toString(),
            'X-Bz-Content-Sha1': imageSHA1,
            'Content-Type': file.type // This should be the MIME type of the file
        };

        const response = await axios.post(uploadUrl, blob, { headers });

        //console.log('Response:', response);

        if (response.status === 200) {
            console.log('File uploaded successfully');
        } else {
            console.log(`Failed to upload file with status: ${response.status}`);
            throw new Error(`Failed to upload file with status: ${response.status}`);
        }
    } catch (error) {
        console.log('Error:', error);
        throw new Error(`Failed to upload file with error: ${error}`);
    }
}
