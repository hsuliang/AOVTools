// netlify/functions/get-youtube-subtitles.js
const fetch = require('node-fetch');

// We use a public Invidious instance as a proxy to fetch YouTube data.
// This is more reliable against YouTube's blocking measures.
// The previous instance returned a 502, switching to another healthy one.
const INVIDIOUS_INSTANCE = 'https://invidious.projectsegfau.lt';

exports.handler = async (event, context) => {
    const { videoId } = event.queryStringParameters;

    if (!videoId) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: '無效或遺失 YouTube 影片 ID。' }),
        };
    }

    const apiUrl = `${INVIDIOUS_INSTANCE}/api/v1/videos/${videoId}?fields=captionTracks`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            // Handle cases where the video is not found or Invidious instance has an issue
            throw new Error(`無法從代理服務獲取影片資訊，狀態碼: ${response.status}`);
        }
        
        const data = await response.json();
        const tracks = data.captionTracks;

        if (!tracks || tracks.length === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: '找不到這部影片的任何字幕軌道。' }),
            };
        }

        // Map the tracks to the format our frontend expects.
        const availableTracks = tracks.map(track => ({
            name: track.label,
            lang: track.language_code,
            // Construct the full, direct URL to the SRT file via the Invidious API.
            // The `&fmt=srt` parameter tells Invidious to convert the subtitles to SRT format.
            baseUrl: `${INVIDIOUS_INSTANCE}${track.url}&fmt=srt`, 
        }));

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
            },
            body: JSON.stringify(availableTracks),
        };

    } catch (error) {
        console.error('Error fetching from Invidious API:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message || '讀取影片資訊時發生未知錯誤。' }),
        };
    }
};