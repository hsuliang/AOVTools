// netlify/functions/download-youtube-subtitle.js
const { getSubtitles } = require('youtube-captions-scraper');

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
 * Converts the JSON output from the scraper library into a standard SRT format string.
 * @param {Array<object>} captions - Array of caption objects from the library.
 * @returns {string} The formatted SRT string.
 */
function convertToSrt(captions) {
    let srtContent = '';
    captions.forEach((caption, index) => {
        const start = parseFloat(caption.start);
        const dur = parseFloat(caption.dur);
        const end = start + dur;
        const text = caption.text;

        srtContent += `${index + 1}
`;
        srtContent += `${formatTime(start)} --> ${formatTime(end)}
`;
        srtContent += `${text}

`;
    });
    return srtContent;
}

exports.handler = async (event, context) => {
    const { videoId, lang } = event.queryStringParameters;

    if (!videoId || !lang) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: '遺失 videoId 或 lang 參數。' }),
        };
    }

    try {
        const captions = await getSubtitles({
            videoID: videoId,
            lang: lang
        });

        if (!captions || captions.length === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: '使用下載工具時找不到指定的字幕軌道。' }),
            };
        }

        const srtContent = convertToSrt(captions);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
            },
            body: srtContent,
        };

    } catch (error) {
        console.error('Error from youtube-captions-scraper:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message || '下載字幕內容時發生錯誤。' }),
        };
    }
};
