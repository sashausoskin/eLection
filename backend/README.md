# eLection backend
This is the backend of eLection. This was created using [TypeScript](https://www.typescriptlang.org/), [Node](https://nodejs.org/en) and [Express](https://expressjs.com/). Other notable libraries are:
- [Socket.IO](https://socket.io/) for handling socket connections.
- [ajv](https://ajv.js.org/) for validating data.
- [jest](https://jestjs.io/) for running unit tests.
- [ESLint](https://eslint.org/) for linting.

## Table of contents
1. [Setup](#setup)
2. [Commands](#commands)
3. [Testing](#testing)
4. [Docker](#docker)

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

## Testing
The backend features robust unit tests that test all the paths of the backend and also tests socket functionality. The unit test coverage is uploaded to Codecov. You can run the unit tests with the command
```bash
npm test
```

You can see the unit test coverage percentage here: [![codecov](https://codecov.io/github/sonicsasha/eLection/graph/badge.svg?token=X4JKDW6CF6)](https://codecov.io/github/sonicsasha/eLection)

Not that Jest will complain about an open handle after the unit tests have finished. It's unknown why this is happening, but it shouldn't cause any issues.

End-to-end tests also cover backend functionality. More information about the end-to-end tests can be found in the [frontend's README](../frontend/README.md)

## Docker
You can build a Docker image of the backend using the command
```bash
docker build -t election-back .
```

After the image has been built, you can start it with the command
```bash
docker run -p 3000:3000 election-back
```
This will start the server in the port 3000. If you want to modify the environment variables, you can use the [--env or --env-file flag](https://docs.docker.com/reference/cli/docker/container/run/#env)