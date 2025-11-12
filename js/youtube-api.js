// js/youtube-api.js
// This file will contain functions for interacting with the YouTube Data API via Netlify Serverless Functions.

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
 * by calling our Netlify serverless function.
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
            // It's better to inform the user that no subtitles are available.
            throw new Error("找不到這部影片的可用字幕。");
        }

        return availableTracks;

    } catch (error) {
        console.error("Error in fetchYouTubeSubtitles:", error);
        // Re-throw the error so the calling function (in the UI) can handle it.
        throw error;
    }
}

/**
 * Downloads the content of a specific subtitle track by calling our Netlify function.
 * @param {string} baseUrl The direct URL to the subtitle's timed text file.
 * @returns {Promise<string>} A promise that resolves to the subtitle content in SRT format.
 */
async function downloadYouTubeSubtitle(baseUrl) {
    if (!baseUrl) {
        throw new Error("無效的字幕下載網址。");
    }
    
    // We need to encode the baseUrl to safely pass it as a URL query parameter.
    const functionUrl = `/.netlify/functions/download-youtube-subtitle?baseUrl=${encodeURIComponent(baseUrl)}`;

    try {
        const response = await fetch(functionUrl);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: `伺服器發生錯誤，狀態碼: ${response.status}` }));
            throw new Error(errorData.error || `無法下載字幕內容。`);
        }

        // The function returns the SRT content as plain text.
        const srtContent = await response.text();
        return srtContent;

    } catch (error) {
        console.error("Error in downloadYouTubeSubtitle:", error);
        throw error;
    }
}

// Export functions if this were a module, or make them globally available if included via script tag
// For now, assuming script tag inclusion, so functions are global.
// If using ES modules later:
// export { getYouTubeVideoId, fetchYouTubeSubtitles };
