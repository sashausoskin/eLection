const fs = require('fs')

console.log('Creating Docker template...')

if (!fs.existsSync('./dockerTemplate')) {
    fs.mkdirSync('./dockerTemplate')
}

fs.copyFileSync('./frontend/public/stylesheet.css', './dockerTemplate/stylesheet.css')
fs.copyFileSync('./docker-compose.yml', './dockerTemplate/docker-compose.yml')
fs.copyFileSync('./frontend/public/img/icon.svg', './dockerTemplate/icon.svg')
fs.copyFileSync('./nginx.conf', './dockerTemplate/nginx.conf')
fs.copyFileSync('./frontend/public/img/bg.png', './dockerTemplate/bg.png')
fs.copyFileSync('./backend/.env.template', './dockerTemplate/backend.env')


if (!fs.existsSync('./dockerTemplate/sslcert')) {
    fs.mkdirSync('./dockerTemplate/sslcert')
}
fs.writeFileSync('./dockerTemplate/sslcert/PUT_YOUR_SSL_CERTIFICATES_HERE.txt', '')

if (!fs.existsSync('./dockerTemplate/locales')) {
    fs.mkdirSync('./dockerTemplate/locales')
}

fs.readdir('./frontend/public/locales/translation/', (_err, files) => {
    files.forEach((file) => {
        const fileData = fs.readFileSync(`./frontend/public/locales/translation/${file}`, 'utf-8')
        const translationObj = JSON.parse(fileData)

        fs.writeFileSync(`./dockerTemplate/locales/${file}`, JSON.stringify({welcomeMessage: translationObj.welcomeMessage}, undefined, 3))
    })
})
