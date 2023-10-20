# SvelteKit API endpoint to upload to BackBlaze

Upload to BackBlaze B2 using from any part of your SvelteKit app or external app using API endpoint `/api/upload`.

## Installation

1. Install dependencies: `npm i axios js-sha1`
2. Get the files [from this commit](https://github.com/kasparpalgi/sveltekit-backblaze/commit/d8936c32447c7202062d248eca7820afdba2699a)
3. Update `src/lib/config/backblaze-upload.js` and move the API keys to ENV variables
4. Update the missing types if I haven't done yet🙂