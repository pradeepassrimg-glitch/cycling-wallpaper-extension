# My Cycling Wallpaper (Chrome Extension)

A Manifest V3 Chrome new-tab extension with cycling wallpapers, Google-style search, shortcuts, an app launcher, a selectable profile image, and page customization.

## Install locally
1. Extract this folder.
2. Open `chrome://extensions` in Chrome.
3. Enable **Developer mode**.
4. Choose **Load unpacked** and select this folder.
5. Put wallpaper files in the `images` folder and name them `1.jpg`, `2.jpg`, `3.png`, etc. (Use consecutive numbers with no gaps.) You can also use **Customize this page** to add images from your computer.
6. Open a new tab to test.

Wallpaper files in the `images` folder are packaged with the extension. Images added from the Customize button are saved locally in the browser profile.

## Notes
- Search uses Chrome's configured search engine when the Chrome search API is available, with Google search as fallback.
- The app launcher uses Google favicon images, so app logos need an internet connection.
