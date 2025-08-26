# Bilibili-comic-Downloader (Check New Version from Github Code )
### :anger: Read the Whole ReadMe before downloading. :anger:
For Now, Added a webtoon downloader. Load the Extension in browser, see [Major Steps](#major-steps)

Scroll to the bottom to load all the images, I'm removing autoscroll from this because bilibili monitoring you, and then click on the extension to download.
### :alien: :alien: Index
<details open>
  <summary> Reasons for Error if Any :anger:</summary>
- Their server is bugged for me or I'm banned I don't really know.
- I've updated the extension, but I can't fully test it.
- Images are save progressively but their name might be fucked up, but they will be in sequence. (e.g. Image-1, Image-3, Image-4, No Image-2 is not missing, the extension has wrongly named it, I've tried everything but can't fix it because its crashing my PC.
- The above reason is why last page is not downloaded sometimes.
- If last page isn't downloaded. Go to the page that is not downloaded and download it again.
- Just set the Manga page to 1 (First) and start downloading.
- If the image doesn't load from server, it can't be downloaded.
</details>


### :question: Issues due to which this is bugged. :question:
- With the latest update to website, they are monitoring your website activity, and blocking the images if it is automated. This is stopping my downloader from working on Pay walled chapters that you bought.
As you might know, most of the code stopped working after they released the newest version of their website. Specifically, they added so many security measures that breaking them was a time taking task, so instead I made the browser download the images itself, so we don't have to break the security. Although some security measures were breached. Kudos to their security though, Simple javascript code to execute on **Web Developer Tools** was't working, even with a lot of code it wasn't working, the final method was to make the browser do itself, not the javascript code, so had to create the extension.
- There are also bugs in the website response, apparently crashing the browser itself.
- The response json are corrupted or are purposely done so? IDK

## Major Steps
  1. You will have to install [Firefox Developer Edition](https://www.mozilla.org/en-US/firefox/developer/)
  2. Now, in the address tab, put ```about:config```, accept everything. we are changing it so that you are able to install custom addons. look for ```xpinstall.signatures.required``` and set it to false, just press the buttons until false appears next to it. done, close it.
  3. Install the addon from the release.

## Bilibili website steps (Normal Manga - Left To Right See Images )
  1. Login to Bilibili website.
  2. Open the manhua chapter you want to download.
  3. You need to make sure that the reading is set "Left to Right" and the Reader's only "Single" mode. Refer to the Screenshots below. If there's no HUD, hover on the lower region of the website.
  4. After all is done, you need to slowly scroll the image slider such that all images are loaded, the again go to start of the page.
  5. Run the extension and do nothing, it'll automate your browser so don't click or do anything meanwhile. (it'll scroll the images)
  6. It'll download all images at once after it's finished.
  
![Step3 ref](docs/img3.png)
![Step3 ref](docs/img4.png)
![Step5 ref](docs/img5.png)
