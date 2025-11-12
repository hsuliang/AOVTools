// netlify/functions/download-youtube-subtitle.js
const fetch = require('node-fetch');

exports.handler = async (event, context) => {
    // The full URL to the SRT file on the Invidious instance is passed from the frontend.
    const encodedSrtUrl = event.queryStringParameters.baseUrl;

    if (!encodedSrtUrl) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: '遺失字幕網址參數 (baseUrl)。' }),
        };
    }
    
    const srtUrl = decodeURIComponent(encodedSrtUrl);

    try {
        const response = await fetch(srtUrl);
        if (!response.ok) {
            throw new Error(`無法從代理服務下載字幕檔案，狀態碼: ${response.status}`);
        }
        
        // The Invidious API with `&fmt=srt` returns the content directly in SRT format.
        const srtContent = await response.text();

        if (!srtContent) {
             return {
                statusCode: 404,
                body: JSON.stringify({ error: '字幕檔案為空或無內容。' }),
            };
        }

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
            },
            body: srtContent,
        };

    } catch (error) {
        console.error('Error downloading final SRT content:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message || '處理字幕下載請求時發生錯誤。' }),
        };
    }
};