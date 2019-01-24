# Google Calendar Box Select

# ![logo](docs/img/main_logo.png)

<h4 align="center">Chrome Extension to (Box) Select multiple Google Calendar events. Currently you can only delete events. </h4>

![trailer](docs/img/demo.gif)

<h5 align="center">
<img src="https://upload.wikimedia.org/wikipedia/en/thumb/1/12/Flag_of_Poland.svg/320px-Flag_of_Poland.svg.png" height="30" width="48"/> <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Flag_of_the_United_Kingdom.svg/320px-Flag_of_the_United_Kingdom.svg.png" height="30" width="48" />

multilingual locale support

</h5>

## :warning: Problem

The process of deleting events is very hacked together since no hooking into underlying (minified) JavaScript code is being done.
Instead of that the **trash can** is actually being clicked to delete events using a **querySelector**, something like this:

```javascript
document
  .querySelector(
    "#xDetDlg > div > div.Tnsqdc > div > div > div.pPTZAe > div:nth-child(2) > div"
  )
  .click();
```

You can see this is not ideal.
Because of this the ideal goal of this extension would be to acquire so many users as to pressure the Google Calendar team into creating a real, stable system of multiple selection, deletion and edition...

## the ideal goal of this extension would be to... [**die**](https://getyarn.io/yarn-clip/9f143220-ed9d-4525-b4ef-b37fd5413768)

![Not the hero we deserved but the one we needed.](https://i.imgur.com/NN4nmKR.gif)

## Usage

`B` - (hold) enter selection mode

`Q` - delete selected events

Keyboard shortcuts **can be changed** in the Extension's options.

## :construction: Before developing

```bash
$ npm install
```

## Develop

```bash
$ npm run dev
```

## Build

Set NODE_ENV variable to 'production' to minify, uglify JS, not create source maps. Use 'development' apart from that to get blazing fast hot reload.

```bash
$ npm run build
```

Deploys to _dist/_ folder.

## Contributions

Very welcome!

Especially dealing with the dreaded... _PROBLEM_.

#### Fairly opinionated stylistic choices.

Using modern ES6 syntax.
Running Prettier with ESLint.

Ideal development experience with VSCode and the ESLint plugin :)

[_.eslintrc.js_](.eslintrc.js): tabs (4 spaces), semicolons, single quotes, CRLF line endings.

## Credits

This boilerplate was used to allow for Webpack module bundling:

- #### [Chrome Extension Webpack Boilerplate](https://github.com/samuelsimoes/chrome-extension-webpack-boilerplate)

Additionally I'd like to personally thank the **StackOverflow community** :heart: :sparkling_heart: :exclamation: :exclamation:

## License

[MIT](LICENSE)
