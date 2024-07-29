# eLection backend
This is the backend of eLection. This was created using [TypeScript](https://www.typescriptlang.org/), [Node](https://nodejs.org/en) and [Express](https://expressjs.com/). Other notable libraries are:
- [Socket.IO](https://socket.io/) for handling socket connections.
- [ajv](https://ajv.js.org/) for validating data.
- [jest](https://jestjs.io/) for running unit tests.
- [ESLint](https://eslint.org/) for linting.

## Setup
Here's how to set up the backend for local development.

1. Install dependencies with
```bash
npm install
```

2. Duplicate the `.env.template` file and rename it to just `.env`. The environment variables control some aspects of the backend. You can open it and read it to find out what each variable does.

3. Create validation schemas with
```bash
npm run build:schema
```
The backend uses [ajv](https://ajv.js.org/) to validate data with JSON schemas, which are automatically generated based on the info in the TypeScript types.

4. Start the server in development environment with
```bash
npm run dev
```

Now your backend server is up and running.🥳

## Commands
```bash
npm run test | npm test
```
Runs the unit tests.
<br></br>

```bash
npm run dev
```
Starts the server in development mode. The server is restarted whenever it detects a change in the files.
<br></br>

```bash
npm run build
```
Converts the project from TypeScript to JavaScript. Placed into the `dist` folder.
<br></br>

```bash
npm run start:test
```
Starts the server in testing mode. This enables some routes intended for end-to-end tests. **DO NOT USE IN PRODUCTION!**
<br></br>

```bash
npm run start:prod
```
Converts the project to JavaScript and starts hosting the server in production mode.
<br></br>

```bash
npm run lint
```
Checks the linting. Can be run with `-- --fix` at the end to fix common linting problems.
<br></br>

```bash
npm run lint build:schema
```
Builds the validation schema based on the values given in the TypeScript type definitions.

```bash
npm run test:coverage
```
Runs the unit tests, but also collects coverage information.

