// netlify/functions/get-youtube-subtitles.js

// To use external packages like 'node-fetch', you'll need to create a package.json
// in your project's root directory and add them as dependencies.
// You can do this by running: npm init -y && npm install node-fetch
const fetch = require('node-fetch');

exports.handler = async (event, context) => {
    // Get the videoId from the query string parameters passed from the frontend
    const { videoId } = event.queryStringParameters;

    // Securely access the API key from Netlify's environment variables
    const apiKey = process.env.YOUTUBE_API_KEY;

    // Validate that the videoId was provided
    if (!videoId) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Missing videoId parameter' }),
        };
    }

    // Validate that the API key is configured on Netlify
    if (!apiKey) {
        // This is a server-side error, so we return a 500 status code
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'YouTube API key is not configured on the server.' }),
        };
    }

    // The YouTube Data API v3 endpoint to list caption tracks for a video
    const apiUrl = `https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId=${videoId}&key=${apiKey}`;

    try {
        // Call the YouTube API
        const response = await fetch(apiUrl);
        const data = await response.json();

        // Handle potential errors returned by the YouTube API itself
        if (data.error) {
            console.error('YouTube API Error:', data.error.message);
            return {
                statusCode: data.error.code || 500,
                body: JSON.stringify({ error: `YouTube API Error: ${data.error.message}` }),
            };
        }

        // The API returns an `items` array. We map over it to create a cleaner list
        // of available subtitle tracks for the frontend.
        const captionTracks = data.items.map(item => ({
            lang: item.snippet.language,
            name: item.snippet.name,
            // The `vssId` is what YouTube uses to identify the track format, e.g., ".srt", ".vtt"
            // We might need this later to download the actual subtitle file.
            vssId: item.snippet.trackKind, 
            trackId: item.id,
        }));

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(captionTracks),
        };

    } catch (error) {
        console.error('Error fetching data from YouTube API:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch data from the YouTube API.' }),
        };
    }
};
