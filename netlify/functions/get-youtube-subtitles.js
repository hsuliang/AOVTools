// netlify/functions/get-youtube-subtitles.js
const ytdl = require('ytdl-core');

exports.handler = async (event, context) => {
    const { videoId } = event.queryStringParameters;

    if (!videoId || !ytdl.validateID(videoId)) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: '無效或遺失 YouTube 影片 ID。' }),
        };
    }

    try {
        const info = await ytdl.getInfo(videoId);
        
        const tracks = info.player_response?.captions?.playerCaptionsTracklistRenderer?.captionTracks;

        if (!tracks || tracks.length === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: '找不到這部影片的任何字幕軌道。' }),
            };
        }

        // Map the tracks to a cleaner format for the frontend
        const availableTracks = tracks.map(track => ({
            name: track.name.simpleText,
            lang: track.languageCode,
            // The baseUrl is the direct URL to the timed text (XML) file.
            // We will pass this to our next function.
            baseUrl: track.baseUrl, 
        }));

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
            },
            body: JSON.stringify(availableTracks),
        };

    } catch (error) {
        console.error('Error fetching video info with ytdl-core:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: '讀取影片資訊時發生錯誤。該影片可能為私人、不存在或已停用字幕。' }),
        };
    }
};