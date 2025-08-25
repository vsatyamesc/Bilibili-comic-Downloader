const pendingDownloads = new Map();
const downloadQueue = [];
let isDownloading = false;

browser.browserAction.onClicked.addListener((tab) => {
  downloadQueue.length = 0;
  isDownloading = false;
  pendingDownloads.clear();

  browser.tabs
    .executeScript(tab.id, {
      code: `
      (async () => {
        const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

        const waitForCanvasUpdate = async (canvas, previousDataURL) => {
          for (let i = 0; i < 10; i++) {
            const ctx = canvas.getContext("2d");
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const isCanvasNonBlack = imageData.data.some((val, idx) => idx % 4 !== 3 && val > 0);
            if (isCanvasNonBlack) {
              const currentDataURL = canvas.toDataURL("image/png");
              if (currentDataURL !== previousDataURL && currentDataURL !== "data:,") {
                return currentDataURL;
              }
            }
            await sleep(1000);
          }
          throw new Error("Canvas did not update within the expected time.");
        };

        const initialRangeInput = document.querySelector('.range-input');
        if (!initialRangeInput) { return; }

        const curr_page = parseInt(initialRangeInput.value, 10);
        let min = parseInt(initialRangeInput.min, 10); 
        const max = parseInt(initialRangeInput.max, 10); 

        if (curr_page >= min) {
          min = curr_page;
        }
        let previousDataURL = null;

        for (let value = min; value <= max; value++) {
          try {
            const rangeInput = document.querySelector('.range-input');
            const canvas = document.querySelector('canvas');
            if (!rangeInput || !canvas) { break; }

            rangeInput.value = value;
            rangeInput.dispatchEvent(new Event('input', { bubbles: true }));
            rangeInput.dispatchEvent(new Event('change', { bubbles: true }));
            await sleep(500);
            const image_name = document.querySelector('.progress-indicator').innerText[0]

            const newDataURL = await waitForCanvasUpdate(canvas, previousDataURL);
            previousDataURL = newDataURL;

            browser.runtime.sendMessage({
              action: "downloadImage",
              dataURL: newDataURL,
              filename: \`image-\${image_name}.png\`
            });
            await sleep(200);

          } catch (err) {
            console.error(\`Failed at value \${value}: \`, err.message);
          }
        }
      })();
    `,
    })
    .catch((err) => console.error(err));
});

browser.runtime.onMessage.addListener((message) => {
  if (message.action === "downloadImage") {
    downloadQueue.push(message);
    processQueue();
  }
});

browser.downloads.onChanged.addListener((delta) => {
  if (
    pendingDownloads.has(delta.id) &&
    delta.state &&
    delta.state.current === "complete"
  ) {
    const urlToRevoke = pendingDownloads.get(delta.id);
    URL.revokeObjectURL(urlToRevoke);
    pendingDownloads.delete(delta.id);
  }
});

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
        pendingDownloads.set(downloadId, objectURL);
        return downloadId;
      } catch (error) {
        URL.revokeObjectURL(objectURL);
        throw error;
      }
    });
}

async function processQueue() {
  if (isDownloading || downloadQueue.length === 0) {
    return;
  }
  isDownloading = true;
  const nextDownload = downloadQueue.shift();
  try {
    await downloadImage(nextDownload.dataURL, nextDownload.filename);
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
