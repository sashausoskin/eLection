# eLection frontend
This is the frontend of eLection. The frontend was developed using [TypeScript](https://www.typescriptlang.org/), [React](https://react.dev/) and [https://vitejs.dev/](Vite). Other notable libraries are:
- [Socket.IO](https://socket.io/) for websocket connections.
- [Axios](https://axios-http.com/) for creating HTTP requests.
- [Vitest](https://vitest.dev/) for unit tests.
- [Cypress](https://www.cypress.io/) for end-to-end tests.
- [react-i18next](https://react.i18next.com/) for localisation.
- [React Spring](https://www.react-spring.dev/) and [@use-gesture](https://github.com/pmndrs/use-gesture) for some animations.
- [dndkit](https://www.dndkit.com) for handling list ordering.
- [Formik](https://formik.org/) for handling forms.
- [Yup](https://github.com/jquense/yup) for form validation.
- [ExcelJS](https://github.com/exceljs/exceljs) for spreadsheet generation.
- [React Tooltip](https://react-tooltip.com/) for creating tooltips.
- [ESLint](https://eslint.org/) for linting.

## Table of contents
1. [Setup](#setup)
2. [Commands](#commands)
3. [Testing](#testing)
	1. [Unit tests](#unit-tests)
	2. [End-to-end tests](#end-to-end-tests)
4. [Docker](#docker)
5. [Translations](#translations)
6. [Other](#other)
## Setup
Here is how to set up the frontend for development.
1. Duplicate the `.env.template` file and rename it to `.env`. These are environment variables that control some functionality in frontend. By default, they shold work for developing on a local machine. You can open the file to see what each variable does.
2. Install dependencies with
```bash
npm install
```
3. Start the development environment with
```bash
npm run dev
```

Now the frontend server should be up and running! 🥳

## Commands
There are some other commands that may be useful during development.

```bash
npm run dev
```
Starts the development environment for the frontend. All changes are automatically applied.
<br/><br/>

```bash
npm run build
```
Compiles the frontend into static files. Can be found in the `dist` folder after compilation.
<br/><br/>

```bash
npm run build:production
```
Same as previous, but builds a version specifically for production.
<br/><br/>

```bash
npm run build:test
```
Builds a static version of the app meant for testing. The testing version disables React Spring animations.
<br/><br/>

```bash
npm run lint
```
Checks the linting of the app. Can be run with `-- --fix` at the end to fix common linting problems.
<br/><br/>

```bash
npm run preview
```
Assuming that the app has been compiled into static files, starts a server that serves those static files.
<br/><br/>

```bash
npm run test | npm test
```
Runs unit tests.
<br/><br/>

```bash
npm run test:e2e
```
Runs end-to-end tests in the command line.
<br/><br/>

```bash
npm run test:e2e-ui
```
Runs end-to-end tests with a GUI. This makes debugging a whole lot easier.
<br/><br/>

```bash
npm run start:e2e
```
Prepares the frontend for end-to-end tests. Compiles the testing version of the frontend and starts serving it.
<br/><br/>

```bash
npm run sync-translations
```
Parses the files to check if there are any new translation keys and adds them to the translation files.

## Testing
The frontend has a small amount of unit tests and it also houses the end-to-end tests.

### Unit tests
Because the app is heavily tied to the backend and sockets, it's very difficult to create effective unit tests. The unit tests mostly try to check that forms work correctly. The test files can be found in [`./src/__test__/`](./src/__test__/). You can run the unit tests with the command
```bash
npm test
```

### End-to-end tests
The frontend also houses the end-to-end tests. The test files can be found in [`./cypress/e2e/`](./cypress/e2e/). To run the end-to-end tests, do the following:

1. Start the **backend** with the testing environment by executing
```bash
npm run start:test
```

2. Start the frontend with the testing environment by executing
```bash
npm run start:e2e
```

3. Start the end-to-end tests with the command
```bash
npm run test:e2e
```

If you want to run the end-to-end tests with a GUI, run the command
```bash
npm run test:e2e-ui
```

Note that currently there is no end-to-end test for testing dragging the candidates around during ranked elections. I was unable to create a consistent test for it, so for now it is disabled.

## Docker
You can build a Docker image of the frontend with the command
```bash
docker build -t election-front .
```
⚠️**NOTE!** You have to pass the environment variables in with the [`--build-args` flag](https://docs.docker.com/build/guide/build-args/). By default, the environment variables in the build are set so that the frontend connects to the locally hosted backend server.

After the image has been built, you can start it with the command
```bash
docker run -p 80:80 election-front
```
This will start the server in port 80.

## Translations
The translation files can be found in [`./public/locales/translation/`](./public/locales/translation/). If any keys need to be added, it's suggested to first add the key to the code and then run the `sync-translations` command.

## Other
This directory also contains all the files used to create the current background in [`./background_files/`](./background_files/)
