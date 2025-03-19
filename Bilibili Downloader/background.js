browser.browserAction.onClicked.addListener(async () => {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });

  if (tab) {
    browser.tabs
      .executeScript(tab.id, {
        code: `
          (async () => {
            const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

            // Function to wait for the canvas to update
            const waitForCanvasUpdate = async (canvas, previousDataURL) => {
              for (let i = 0; i < 10; i++) { // Max retries: 10 (10 seconds)
                const canvas = document.querySelector('canvas');
                const ctx = canvas.getContext("2d");
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

                // Check if the canvas is not all black
                const isCanvasNonBlack = imageData.data.some((value, index) => {
                  // Ignore alpha channel (every fourth byte)
                  return index % 4 !== 3 && value > 0;
                });
                  if(isCanvasNonBlack){
                  const currentDataURL = canvas.toDataURL("image/png");
                  if (currentDataURL !== previousDataURL) {
                    return currentDataURL;
                  }}
                  
                  await sleep(1000); // Poll every 1 second
              }
              throw new Error("Canvas did not update within the expected time.");
            };

            // Find the range input
            const rangeInput = document.querySelector('.range-input');
            if (!rangeInput) {
              return { error: "No range input found on the page." };
            }

            // Get min and max values
            const min = parseInt(rangeInput.min, 10);
            const max = parseInt(rangeInput.max, 10);

            // Collect Data URLs for each value
            const canvas = document.querySelector('canvas');
            if (!canvas) {
              return { error: "No canvas found on the page." };
            }

            let previousDataURL = null;
            const dataURLs = [];
            for (let value = min; value <= max; value++) {
              rangeInput.value = value; // Set the range input to the current value
              rangeInput.dispatchEvent(new Event('input', { bubbles: true })); // Trigger input event
              rangeInput.dispatchEvent(new Event('change', { bubbles: true })); // Trigger change event
              await new Promise((resolve) => setTimeout(resolve, 1000));
              try {
                const newDataURL = await waitForCanvasUpdate(canvas, previousDataURL);
                dataURLs.push(newDataURL);
                previousDataURL = newDataURL; // Update previous DataURL
              } catch (err) {
                console.error(\`Failed at value \${value}: \`, err.message);
              }
            }

            return { dataURLs, min, max };
          })();
        `,
      })
      .then((results) => {
        if (results && results[0]) {
          const { dataURLs, min, max } = results[0];
          console.log(
            `Collected ${dataURLs.length} Data URLs from range ${min} to ${max}`
          );

          // Loop over Data URLs and download each one
          dataURLs.forEach((dataURL, index) => {
            downloadImage(dataURL, `image-${index + min + 1}.png`);
          });
        } else {
          console.error("No DataURLs received from content script.");
        }
      })
      .catch((err) => {
        console.error("Error executing script:", err);
      });
  }
});

// Function to download the image using the browser.downloads API
function downloadImage(dataURL, filename) {
  fetch(dataURL)
    .then((response) => response.blob())
    .then((blob) => {
      const objectURL = URL.createObjectURL(blob);
      browser.downloads
        .download({
          url: objectURL,
          filename: filename,
          saveAs: false, // Automatically download without prompting
        })
        .then(() => {
          console.log(`Image ${filename} downloaded successfully!`);
        })
        .catch((err) => {
          console.error(`Download failed for ${filename}:`, err);
        });
    })
    .catch((err) => {
      console.error("Error fetching the DataURL:", err);
    });
}
