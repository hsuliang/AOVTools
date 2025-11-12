// js/youtube-api.js

/**
 * Extracts the YouTube video ID from various URL formats.
 * @param {string} url The YouTube video URL.
 * @returns {string|null} The 11-character video ID or null if not found.
 */
function getYouTubeVideoId(url) {
    if (!url) return null;
    const regex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

/**
 * Fetches the list of available subtitle tracks for a given YouTube video URL
 * by calling our Netlify serverless function (which uses the official YouTube API).
 * @param {string} videoUrl The YouTube video URL.
 * @returns {Promise<Array>} A promise that resolves to an array of available subtitle tracks.
 */
async function fetchYouTubeSubtitles(videoUrl) {
    const videoId = getYouTubeVideoId(videoUrl);
    if (!videoId) {
        throw new Error("無效的 YouTube 網址，請確認格式是否正確。");
    }

    console.log(`Fetching subtitle tracks for video ID: ${videoId}`);
    
    const functionUrl = `/.netlify/functions/get-youtube-subtitles?videoId=${videoId}`;

    try {
        const response = await fetch(functionUrl);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: `伺服器發生錯誤，狀態碼: ${response.status}` }));
            throw new Error(errorData.error || `無法讀取字幕列表，請稍後再試。`);
        }

        const availableTracks = await response.json();
        
        if (!availableTracks || availableTracks.length === 0) {
            throw new Error("找不到這部影片的可用字幕。");
        }

        return availableTracks;

    } catch (error) {
        console.error("Error in fetchYouTubeSubtitles:", error);
        throw error;
    }
}

/**
 * Downloads the content of a specific subtitle track using the scraper function.
 * @param {string} videoId The ID of the YouTube video.
 * @param {string} lang The language code of the subtitle track to download.
 * @returns {Promise<string>} A promise that resolves to the subtitle content in SRT format.
 */
async function downloadYouTubeSubtitle(videoId, lang) {
    if (!videoId || !lang) {
        throw new Error("無效的 videoId 或語言代碼。");
    }
    
    const functionUrl = `/.netlify/functions/download-youtube-subtitle?videoId=${videoId}&lang=${lang}`;

    try {
        const response = await fetch(functionUrl);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: `伺服器發生錯誤，狀態碼: ${response.status}` }));
            throw new Error(errorData.error || `無法下載字幕內容。`);
        }

        const srtContent = await response.text();
        return srtContent;

    } catch (error) {
        console.error("Error in downloadYouTubeSubtitle:", error);
        throw error;
    }
}