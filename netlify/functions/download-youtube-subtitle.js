// netlify/functions/download-youtube-subtitle.js
const fetch = require('node-fetch');

/**
 * Formats seconds into SRT timestamp format HH:MM:SS,ms.
 * @param {number} seconds - The time in seconds.
 * @returns {string} The formatted time string.
 */
function formatTime(seconds) {
    const date = new Date(0);
    date.setMilliseconds(seconds * 1000);
    return date.toISOString().substr(11, 12).replace('.', ',');
}

/**
 * Unescapes basic HTML entities from YouTube's timed text.
 * @param {string} text - The text to unescape.
 * @returns {string} The unescaped text.
 */
function unescapeHtml(text) {
    if (!text) return '';
    // This is a minimal set of replacements. More complex entities might need a library.
    return text.replace(/&amp;/g, '&')
               .replace(/&lt;/g, '<')
               .replace(/&gt;/g, '>')
               .replace(/&quot;/g, '"')
               .replace(/&#39;/g, "'");
}

exports.handler = async (event, context) => {
    // The baseUrl from the frontend will be URL encoded. We must decode it.
    const encodedBaseUrl = event.queryStringParameters.baseUrl;

    if (!encodedBaseUrl) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: '遺失 baseUrl 參數。' }),
        };
    }
    
    const baseUrl = decodeURIComponent(encodedBaseUrl);

    try {
        const response = await fetch(baseUrl);
        if (!response.ok) {
            throw new Error(`無法下載字幕檔案，狀態碼: ${response.status}`);
        }
        const xmlText = await response.text();

        // Use regex to parse the timed text XML format from YouTube.
        // This captures the start time, duration, and the text content.
        const lines = xmlText.matchAll(/<text start="([^"]+)" dur="([^"]+)">([^<]*)<\/text>/g); // Corrected escaping for <\/text>
        
        let srtContent = '';
        let i = 1;

        for (const line of lines) {
            const start = parseFloat(line[1]);
            const dur = parseFloat(line[2]);
            // The text content needs to be unescaped from HTML entities.
            const text = unescapeHtml(line[3]);

            const end = start + dur;

            srtContent += `${i}\n`;
            srtContent += `${formatTime(start)} --> ${formatTime(end)}\n`;
            srtContent += `${text.trim()}\n\n`;
            i++;
        }

        if (!srtContent) {
             return {
                statusCode: 404,
                body: JSON.stringify({ error: '字幕檔案為空或格式不符。' }),
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
        console.error('Error downloading or parsing subtitle:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message || '處理字幕下載請求時發生錯誤。' }),
        };
    }
};
