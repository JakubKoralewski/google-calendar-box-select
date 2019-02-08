# Google Calendar Box Select [![](https://img.shields.io/travis/com/JakubKoralewski/google-calendar-box-select/master.svg)](https://travis-ci.com/JakubKoralewski/google-calendar-box-select/builds) [![](https://img.shields.io/github/release/JakubKoralewski/google-calendar-box-select.svg?label=stable)](https://github.com/JakubKoralewski/google-calendar-box-select/releases/latest) [![](https://img.shields.io/github/release-pre/JakubKoralewski/google-calendar-box-select.svg?label=unstable)](https://github.com/JakubKoralewski/google-calendar-box-select/releases/tag/experimental)

# ![logo](docs/img/main_logo.png)

<h4 align="center">Chrome Extension to (Box) Select multiple Google Calendar events. Built with TypeScript and Webpack. </h4>

![trailer](docs/img/demo.gif)

<h5 align="center">
<img src="https://upload.wikimedia.org/wikipedia/en/thumb/1/12/Flag_of_Poland.svg/320px-Flag_of_Poland.svg.png" height="30" width="48"/> <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Flag_of_the_United_Kingdom.svg/320px-Flag_of_the_United_Kingdom.svg.png" height="30" width="48" />

multilingual locale support

</h5>

## Usage

`B` - (hold) enter selection mode

`Q` - delete selected events

Keyboard shortcuts **can be changed** in the Extension's options.

## :construction: Before developing

```bash
$ npm install
```

## Develop

For developing this extension I **strongly** recommend [VSCode][vscode] with these settings:

### VSCode settings ([`settings.json`](.vscode/settings.json)):
[Prettier plugin][prettier] + [TSLint plugin][tslint] + (optionally) [Debugger for Chrome][debugger] in [VSCode][vscode].

This extension is written in TypeScript and [VSCode][vscode] provides great TypeScript IntelliSense.
[Debugger for Chrome][debugger] allows you to debug compiled TypeScript in Chrome and TypeScript synchronously.

[prettier]: https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode
[tslint]: https://marketplace.visualstudio.com/items?itemName=ms-vscode.vscode-typescript-tslint-plugin
[debugger]: https://marketplace.visualstudio.com/items?itemName=msjsdiag.debugger-for-chrome
[vscode]: https://code.visualstudio.com/

```bash
$ npm run dev
```

## Build

Set NODE_ENV variable to `production` to minify, uglify JS, not create source maps. Use `development` apart from that to get blazing fast hot reload.

```bash
$ npm run build
```

Deploys to `build/` folder.

## Contributions

Very welcome! Especially dealing with the dreaded... _PROBLEM_.

Modern ES6+ syntax in TypeScript compiled to ES5 for maximum compatibility.

### Style ([`tslint.json`](src/tslint.json)):
`tabs` (`4 spaces` long), `semicolons`, `single quotes`, `CRLF line endings`.

### ES6+ features encouraged ([`tsconfig.json`](src/tsconfig.json)):
target: `ES5`, lib: `dom, es2018`.

## :warning: Problem

The process of deleting events is very hacked together since no hooking into underlying (minified) JavaScript code is being done.
Instead of that the **trash can** is actually being clicked to delete events using a **querySelector**, something like this:

```javascript
document
	.querySelector(
		'#xDetDlg > div > div.Tnsqdc > div > div > div.pPTZAe > div:nth-child(2) > div'
	)
	.click();
```

You can see this is not ideal.
Because of this the ideal goal of this extension would be to acquire so many users as to pressure the Google Calendar team into creating a real, stable system of multiple selection, deletion and edition...

## the ideal goal of this extension would be to... [**die**](https://getyarn.io/yarn-clip/9f143220-ed9d-4525-b4ef-b37fd5413768)

![Not the hero we deserved but the one we needed.](https://i.imgur.com/NN4nmKR.gif)

## Credits

This boilerplate was used to allow for Webpack module bundling:

-   #### [Chrome Extension Webpack Boilerplate](https://github.com/samuelsimoes/chrome-extension-webpack-boilerplate)

Additionally I'd like to personally thank the **StackOverflow community** :heart: :sparkling_heart: :exclamation: :exclamation:

## License

[MIT](LICENSE)
