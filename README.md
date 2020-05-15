# Mini Padder

[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)][JavaScript Standard Style]

![Default Skins]

Simple gamepad input overlay for streaming, with default skins that keep a good readability even in tough encoding situations.

- Supports 4 gamepads simultaneously.
- Default skins for XInput, DInput, 8-button arcade joysticks and 6-button gamepads.
- Fade-out effect for unused buttons, of which the duration and opacity can be adjusted.
- Directly capture from OBS without running external programs.

# Requirements

- A **Chromium** browser environment and access to local storage. Because that's the environment of OBS browser source Mini Padder is originally made for.
- Features confirmed to be working on **OBS 24.0.3** and onward. On OBS 21.1.0 and below, gamepad inputs might not be received.

# How to Use

- From OBS browser source, put the address of the [hosted webpage] as URL. Recommended Width and Height is 1048 × 600.
- Right click the source, select *Transform -> Edit Transform...* to **crop off outside of the intended display area**.  
  The intended display area vary with the way multiple gamepads are displayed. Single gamepad area is 256 × 144, and the overall area size will be displayed on the control panel. Each gamepad areas are spaced by 8 pixels.
- To make a change using the control panel, right click the source and select *Interact*.
- The page will start showing gamepads when any input is made on them.

To add or customize skins, you have to download the application and host it yourself.

# Exporting & Importing Settings

A local web page is not allowed to read files from the computer, so these progresses couldn't be made simple.

- If you made a custom skin, put the whole folder in `skin` folder, then include the folder name in the skin list. You can access the list via the control panel.  
Folder name should be made of alphanumericals, hyphen and underscore. For now letter case matters.
- If you want to keep settings for the application outside of it, you can copy them as a form of JSON text from the page. Paste such text to import settings.

---

I tried to make this application to prove to myself that I can make and *complete* making a thing. Also that I can use it for my own streams.

If you find it useful and somehow making some parts of your life better, please consider making a [donation](https://ko-fi.com/dinir). 

Thank you for reading all the way to the end! 😁



[Default Skins]: ./image/open-graph-image.png 'All default skins'
[Input Assignment on 8Bitdo NES30 Pro]: ./image/Assignment.gif '(564.7kB) Assigning buttons for 8Bitdo NES30 Pro'

[hosted webpage]: https://dinir.github.io/mini-padder/
[latest release]: https://github.com/Dinir/mini-padder/releases/latest
[JavaScript Standard Style]: https://standardjs.com
