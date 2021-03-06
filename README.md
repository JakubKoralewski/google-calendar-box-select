# Google Calendar Box Select [![](https://img.shields.io/travis/com/JakubKoralewski/google-calendar-box-select/master.svg?label=build&logo=travis)](https://travis-ci.com/JakubKoralewski/google-calendar-box-select/builds) [![](https://img.shields.io/github/release/JakubKoralewski/google-calendar-box-select.svg?label=latest%20stable)](https://github.com/JakubKoralewski/google-calendar-box-select/releases/latest) [![](https://img.shields.io/github/release-pre/JakubKoralewski/google-calendar-box-select.svg?label=latest%20any)](https://github.com/JakubKoralewski/google-calendar-box-select/releases) 

<p align="center">
    <img src="docs/img/box-select-icon.png" width="200" align="center" />
</p>

<h4 align="center">Web Extension to (Box) Select multiple Google Calendar events. Built with TypeScript and Webpack. Supports Chrome and experimentally Firefox and Opera. </h4>

![trailer](docs/img/demo.gif)

<h5 align="center">
<img src="https://upload.wikimedia.org/wikipedia/en/thumb/1/12/Flag_of_Poland.svg/320px-Flag_of_Poland.svg.png" height="30" width="48"/> <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Flag_of_the_United_Kingdom.svg/320px-Flag_of_the_United_Kingdom.svg.png" height="30" width="48" />

multilingual locale support

[![](https://img.shields.io/badge/help%20translate-web--ext--translator-brightgreen.svg)](https://lusito.github.io/web-ext-translator/?gh=https://github.com/JakubKoralewski/google-calendar-box-select)

</h5>

<p align="center">The extension works by repeating an action on one of the selected events and applying it to the rest. 
<br/>Using the original as a source a Fetch request is made changing just the necessary properties (e.g., the event ID, start date, end date or color). </p> 

## Usage

`B` - (hold) enter selection mode

`Q` - delete selected events

Keyboard shortcuts **can be changed** in the Extension's options.

You can click the extension icon to view a simple toolbar letting you select as well as delete all selected events. Deleting all selected events from the pop-up uses hardcoded CSS-based selectors instead of repeating an HTTP request.

### Supported features are: 
- repeating these actions to selected events:
  - [x] deleting,
  - [x] dragging (including changing duration),
  - [x] changing color.


[webextension-polyfill]: https://github.com/mozilla/webextension-polyfill
## Develop
For developing this extension I **strongly** recommend the free editor - [VSCode][vscode].

### Step 1

```bash
$ npm install
$ npm run dev
```

### Step 1.5 (only the first time!)

Load the extension in Chrome. Click `Load unpacked` and choose the `build` folder.
<img src="https://i.imgur.com/JQ9kNdh.png" />

### Step 2 (after every change)

If the app has recompiled and you want to view the changes you have to reload the extension.

You can do this either with the [Extensions Reloader][extensions-reloader]:

<img src="https://i.imgur.com/SHtxkaf.png" />

or manually:

![](https://i.imgur.com/ldXgh6C.png)


### VSCode settings ([`settings.json`](.vscode/settings.json)):

[Prettier plugin][prettier] + [TSLint plugin][tslint] + (optionally) [Debugger for Chrome][debugger] in [VSCode][vscode].

This extension is written in TypeScript and [VSCode][vscode] provides great TypeScript IntelliSense.
[Debugger for Chrome][debugger] allows you to set breakpoints in VSCode and debug in VSCode as well; however, I didn't find this too practical and also a bit buggy.

Consider these tools to simplify your workflow: [Extensions Reloader][extensions-reloader], [Webpack Chrome Extension Reloader][webpack-chrome-extension-reloader] (commented out by default).

[prettier]: https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode
[tslint]: https://marketplace.visualstudio.com/items?itemName=ms-vscode.vscode-typescript-tslint-plugin
[debugger]: https://marketplace.visualstudio.com/items?itemName=msjsdiag.debugger-for-chrome
[vscode]: https://code.visualstudio.com/
[extensions-reloader]: https://chrome.google.com/webstore/detail/extensions-reloader/fimgfedafeadlieiabdeeaodndnlbhid?hl=pl
[webpack-chrome-extension-reloader]: https://www.npmjs.com/package/webpack-chrome-extension-reloader

## Build

Set NODE_ENV variable to `production` to minify generated JS and disable source maps. Use `development` apart from that to get blazing fast hot reload.

```bash
$ npm run build
```

Deploys to `build/` folder. Zip folder for distribution or open the directory in Chrome for developing `⋮ >> More tools >> Extensions >> Load unpacked` ([chrome://extensions/](chrome://extensions/)).

## Contributions

### Considered features you could help with are:
- [X] moving selected events while dragging,
- [ ] special context menu,
- [ ] copying events,
- [ ] SHIFT or ALT selection to respectively add and remove from selected,
- [ ] CTRL+Z undo mechanism,
- [ ] changing title to multiple events at a time,
- [ ] inserting multiple events at a time,
- [ ] using [Mozilla's WebExtension polyfill][webextension-polyfill] to support Firefox, Chrome, Opera and Edge.

Very welcome! Please follow the provided `TSLint` rules. Use [Prettier][prettier] to stop your code from becoming too long. Don't shun from using modern (ES6+) syntax, arrow functions and the like.

### Style ([`tslint.json`](src/tslint.json)):

`tabs`, `semicolons`, `single` quotes, `CRLF` line endings.

### ES6+ features encouraged ([`tsconfig.json`](src/tsconfig.json)):

target: `ES5`, lib: `dom, es2018`.

## :warning: Problem

The process of deleting events is very hacked together since no hooking into underlying (minified) JavaScript code is being done.
Instead of that the **trash can** is actually being clicked to delete events using a **querySelector** with hardcoded selectors:

```css
#xDetDlg > div > div.Tnsqdc > div > div > div.pPTZAe > div:nth-child(2) > div
```

You can see this is not ideal.
Because of this the ideal goal of this extension would be to acquire so many users as to pressure the Google Calendar team into creating a stable system of multiple selection, deletion and editing...

## the ideal goal of this extension would be to... [**die**](https://getyarn.io/yarn-clip/9f143220-ed9d-4525-b4ef-b37fd5413768)

![Not the hero we deserved but the one we needed.](https://i.imgur.com/NN4nmKR.gif)

## Credits

This boilerplate was used to allow for Webpack module bundling:

-   #### [Chrome Extension Webpack Boilerplate](https://github.com/samuelsimoes/chrome-extension-webpack-boilerplate)

Additionally I'd like to personally thank the **StackOverflow community** :heart: :sparkling_heart: :exclamation: :exclamation:

## License

[MIT](LICENSE)
