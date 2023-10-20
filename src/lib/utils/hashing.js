import sha1 from 'js-sha1';

/** @param {Blob} file @returns {Promise<string>} */
export async function calculateSHA1(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onloadend = function (evt) {
            // @ts-ignore
            if (evt.target.readyState == FileReader.DONE) {
                // @ts-ignore
                const arrayBuffer = evt.target.result;
                // @ts-ignore
                const hash = sha1(arrayBuffer);
                resolve(hash);
            }
        };
        reader.onerror = reject;
    });
}
