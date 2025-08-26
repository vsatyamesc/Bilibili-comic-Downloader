// A queue to hold incoming download requests
const downloadQueue = [];
// A flag to ensure we only process one download at a time
let isDownloading = false;
// A map to track downloads and their temporary URLs for later cleanup
const pendingDownloads = new Map();

// When the user clicks the extension icon
browser.browserAction.onClicked.addListener((tab) => {
  // Clear the state from any previous runs
  downloadQueue.length = 0;
  isDownloading = false;
  pendingDownloads.clear();

  // Execute the script on the page
  browser.tabs
    .executeScript(tab.id, {
      code: `
      (async () => {
        // Find all canvas elements on the page in the order they appear
        const canvases = document.querySelectorAll('canvas');
        
        if (!canvases || canvases.length === 0) {
          console.log("Extension: No canvas elements found on this page.");
          return;
        }

        console.log(\`Extension: Found \${canvases.length} canvases. Starting capture...\`);

        // Loop through each canvas
        for (let i = 0; i < canvases.length; i++) {
          const canvas = canvases[i];
          try {
            // Convert the canvas content to a Data URL
            const dataURL = canvas.toDataURL("image/png");

            // Skip if the canvas is blank
            if (dataURL === "data:,") {
              console.log(\`Extension: Skipping blank canvas at index \${i}.\`);
              continue;
            }

            // Send a message to the background script to download this image
            browser.runtime.sendMessage({
              action: "downloadImage",
              dataURL: dataURL,
              filename: \`image-\${i + 1}.png\` // Name files like image-1.png, image-2.png, etc.
            });
            
            // A small delay to be kind to the browser's main thread
            await new Promise(resolve => setTimeout(resolve, 100));

          } catch (err) {
            console.error(\`Extension: Failed to capture canvas at index \${i}: \`, err.message);
          }
        }
      })();
    `,
    })
    .catch((err) => console.error("Error executing script:", err));
});

// The message listener adds jobs to the queue
browser.runtime.onMessage.addListener((message) => {
  if (message.action === "downloadImage") {
    downloadQueue.push(message);
    processQueue();
  }
});

// Listener to clean up URLs AFTER downloads are complete
browser.downloads.onChanged.addListener((delta) => {
  if (
    pendingDownloads.has(delta.id) &&
    delta.state &&
    delta.state.current === "complete"
  ) {
    const urlToRevoke = pendingDownloads.get(delta.id);
    URL.revokeObjectURL(urlToRevoke);
    pendingDownloads.delete(delta.id);
    console.log(`Cleaned up URL for download ID: ${delta.id}`);
  }
});

// Download function that uses the reliable ObjectURL method
function downloadImage(dataURL, filename) {
  return fetch(dataURL)
    .then((response) => response.blob())
    .then(async (blob) => {
      const objectURL = URL.createObjectURL(blob);
      try {
        const downloadId = await browser.downloads.download({
          url: objectURL,
          filename: filename,
          saveAs: false,
        });
        // Store the URL to clean up safely after the download finishes
        pendingDownloads.set(downloadId, objectURL);
        return downloadId;
      } catch (error) {
        // If the download fails to start, revoke immediately
        URL.revokeObjectURL(objectURL);
        throw error;
      }
    });
}

// The function that processes the queue one by one
async function processQueue() {
  if (isDownloading || downloadQueue.length === 0) {
    return;
  }
  isDownloading = true;
  const nextDownload = downloadQueue.shift();
  try {
    await downloadImage(nextDownload.dataURL, nextDownload.filename);
    console.log(`Successfully initiated: ${nextDownload.filename}`);
  } catch (err) {
    console.error(
      `Failed to process download for: ${nextDownload.filename}`,
      err
    );
  } finally {
    isDownloading = false;
    processQueue();
  }
}
