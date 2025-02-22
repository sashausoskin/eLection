<div align="center">
  <img src="https://github.com/user-attachments/assets/4ba1a8ad-981f-4154-bd27-190feb6ae791"/>
  <h1>eLection</h1>
  <a href=https://github.com/sashausoskin/eLection/actions/workflows/test.yml><img src=https://github.com/sashausoskin/eLection/actions/workflows/test.yml/badge.svg /></a>
  <br />
  Backend unit test coverage:
  <br />
  <a href=https://codecov.io/github/sashausoskin/eLection><img src=https://codecov.io/github/sashausoskin/eLection/graph/badge.svg?token=X4JKDW6CF6 href=https://codecov.io/github/sashausoskin/eLection /></a>
</div>

Welcome to eLection!

This is a self-hosted real-time voting systems intended for small to mid-sized organizations to use in order to locally organize votings and election. This project was made for the University of Helsinki's [Full Stack Open](https://fullstackopen.com/) course. This app was made with [TypeScript](https://www.typescriptlang.org/), [React](https://react.dev/) and [Node Express](https://expressjs.com/).

The idea for this project arose when a general meeting with several elections took around five hours because of the long process of handing everyone ballots and pens, taking them back and counting the votes by hand. This app tries to fix those issues.

This app is:
- **Easy to use**:  There are no logins and accounts. Start the server and you are ready to host elections. 😎
- **Easy to deploy**: Have a server with Docker installed? Great! Just download the template, place your SSL certificates and with one command your server is up running! 🏃‍♂️💨
- **Secure**: The voting process is anonymous, while also being secure. Only those who are deemed eligible to vote are able to participate. Authentication is done using JWT encryption 🔒
- **Highly customisable**: When deploying this app, you can customize the app with your branding, color palette and even customize the app's strings, for example, to add additional instructions. ✍️
- **Multilingual**: Right now this app only has official support for English and Finnish, but it is easy to add more languages 🌐

Right now you can organize two types of elections:
- **First-past-the-post elections**: Voters select one candidate to vote for.
- **Ranked elections**: Voters rank a number of candidates and the higher their rank is, the more votes they receive.

You can check the demo version of eLection here: https://election-frontend-4vqy.onrender.com. **NOTE!** The server is running in Oregon and it is using the free version of Render, so it may be a bit slow.

This app is only meant to be used as a tool to organise elections or other kinds of voting. You can download election results as an Excel spreadsheet after an election has ended, but the results are not stored on the server.

## Table of contents
1. [Maintentance](#maintenance)
2. [How to use](#how-to-use)
    1. [Host](#host)
    2. [Participant](#participant)
3. [Development installation](#development-installation)
4. [Production installation](#production-installation)
	1. [Customisation](#customisation)
	2. [Updating](#updating)

## Maintenance
I do not plan on actively maintaining this app besides doing some library updates every now and then and maybe some QoL improvements. If there is a feature you really want to see, create a pull request or create an issue.

## How to use
### Host
<img  width=500 src=https://github.com/user-attachments/assets/8d04dee2-d2e9-41c5-aa56-34f1ed1e0a3c alt='The host view' />

1. Click 'Host an election'. This will get you into the host view. At the top, you will see the lobby code. Give this to other people who want to join your lobby as participants.
2. Click 'Open the viewer window'. A new window will open. Place this window somewhere where all participants can see it. The viewer will show information regarding the lobby, including how to join the lobby and election results.
3. When someone tries to join your lobby, they should show you their user code. If you deem that they should be able to vote in your elections, enter their user code and press 'Submit'.
4. When you are ready to create an election, scroll down a bit and fill out the form. Hover over the info icons to see the differences between the election types. If you want to add more candidates, press the + button. When you are ready to start the election, press 'Start election'. Now all the participants should be able to vote in your election on their devices. The viewer window shows how many people have voted and how many participants there are in total.
5. When you are ready to end the election, press 'End election'. After this the participants will no longer be able to vote and the results will be shown in the viewer window.

### Participant
1. Click 'Participate in an election'.
2. You will be asked for the code of the lobby you want to join. Enter the code and press 'Submit'.
3. You will now see your user code. Show this code to the host of the lobby. After they authenticate you, you will automatically be put into the lobby.
4. After an election starts, you can vote on your device. You can also cast an empty vote.
5. After an election ends, you can see the results in the viewer window.

## Development installation
First, clone this repository. Then check out the READMEs for both [the backend](./backend/README.md) and the [frontend](./frontend/README.md) as they have information on how to set them up for development.

## Production installation
This guide will show you how to install the app on your server. 
1. [Install Docker](https://docs.docker.com/engine/install/)
2. Create a directory for the application
3. Download the [eLection Docker template](https://github.com/sashausoskin/eLection/releases/latest/download/docker-template.zip) and extract the contents to the newly created folder.
4. It is highly recommended to use SSL certificates for your server. If you have them, place them in the `sslcert` folder and name them `domain.pem` and `domain-key.pem` respectively. If you do not want to protect your traffic, open `nginx.conf` and follow the instructions in the comments.
5. Open the directory in your terminal and run `docker compose up -d`. Now the server should be running on port 443 (or 80 if you disabled SSL).

⚠️**NOTE!** Because of how the websocket Socket.IO functions, this server does not work behind a page path (such as company.com/eLection). Instead try to use subdomains (such as election.company.com)

⚠️**ANOTHER NOTE!** While the template is designed to be future-proof, changes to it are possible. So if the server suddenly stops functioning after an update or if there is something you wish you could modify, check the template from the latest release.

### Customisation
You can freely modify the files in the template to create the look you want and to modify how the backend functions.

`stylesheet.css` shows some exposed variables that can be used to create the visual look you want. You can control the color palette and the style of the background image. The file has more information on the variables. You can also import additional fonts using [@import](https://developer.mozilla.org/en-US/docs/Web/CSS/@import).

`bg.png` is the image shown in the background of the app. Note that this has to be a .png image.

`icon.svg` is the icon that is shown at the top left of the app. Note that this has to be a .svg file.

`locales` contains custom translation files. Any translations in these files will override the translations maintained in the repository. For example, if you decide to host this app in a closed network, you can add instructions on which network to join by adding the key `viewer.joiningInformation` to the translation files and adding the instructions there. Check the [repo's translation file](https://github.com/sonicsasha/eLection/blob/main/frontend/public/locales/translation/en.json) to see which keys you can use.

For example, this is the theme created for the North Ostrobothnian Nation:

<img src=https://github.com/user-attachments/assets/cc01229c-2151-409d-b126-e8a0594021f4 width=500>

### Updating
The server does not auto-update itself. Instead, at least for now, the server needs to be restarted to be updated. If you want to disable auto-updates on restart, open `docker_compose.yml` and remove all of the `pull_policy` fields

To restart the app on the server:
1. If the Docker container is still running, shut it down with the command 
```bash
docker compose down
```
2. Start the server back up with
```bash
docker compose up -d
```
It should automatically fetch the latest version of the app.

3. Remove old versions of the images with
```bash
docker image prune -a
```
Note that this may also affect other Docker containers.

If auto-updates are disabled, you need to also run the command
```bash
docker compose pull
```
after the container is shut down.




