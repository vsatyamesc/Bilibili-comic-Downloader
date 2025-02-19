# Bilibili-comic-Downloader (Has Stopped Working, will be archived till a working version is uploaded)
download Bilibili manga/comic images through Python or Windows Executable.  
Windows Executable File can be found in Release.

## For Python
### Requirements
```
numpy==1.22.4
requests==2.26.0
```
you can install them by 
> pip install -r requirements.txt

### How to Run
Execute "bilibili.py" through
> python bilibili.py

Input chapter link and SESSDATA or Your Cookie
Example -  
![SESSDATA Example](https://i.imgur.com/3zqgoqM.png)

You can get it from here -  
![SESSDAT GET](https://i.imgur.com/F5bCbi8.png)

It should download the Image under New folder called "Comic" and the images will be under "Comic Name" and "Chapter Name"

## Windows Executable
### Requirements - 
Good Internet  
Microsoft Visual C++ Redistributable latest (Included in the Release Package)  
### Get SESSDATA  
SESSDATA is found inside Cookies  
Example -  
![SESSDATA Example](https://i.imgur.com/3zqgoqM.png)


### How To Run -
1. Install the Microsoft Visual C++ Redistributable packages, Named - VC_redist.x64.exe, VC_redist.x86.exe  
2. Run BiliBili Ripper.exe  
3. Input the Chapter link  
4. Input SESSDATA  
5. It should download all the images of that chapter in a separate folder called Comic. Inside it will be Manga title and Chapter Name.  
