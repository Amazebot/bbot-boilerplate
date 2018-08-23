const fs = require('fs')
const { promisify } = require('util')
const inquirer = require('./node_modules/inquirer')
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

async function replaceInFile (file, regex, value) {
  const content = await readFile(file, 'utf8')
  const update = content.replace(regex, value)
  await writeFile(file, update, 'utf8')
}

inquirer.prompt([
  {
    type: 'input',
    name: 'package',
    message: 'Name your node package',
    default: 'bbot-bot',
    validate: (name) => (new RegExp('^[a-z@/-]*$').test(name))
      ? true
      : 'Invalid name for npm package.'
  },
  {
    type: 'input',
    name: 'bot',
    message: 'Name your new bot',
    default: 'bot'
  },
  {
    type: 'input',
    name: 'author',
    message: 'What is your name?'
  },
  {
    type: 'input',
    name: 'email',
    message: 'Email (for package author field)'
  },
  {
    type: 'confirm',
    name: 'env',
    message: 'Create .env with defaults?'
  }
]).then(async (answers) => {
  if (answers.package) {
    await replaceInFile(
      './package.json',
      /^(\s\s"name":\s")(.*?)(")/gm,
      `$1${answers.package}$3`
    )
  }
  if (answers.bot) {
    await replaceInFile(
      './package.json',
      /^(\s{2}"bot": {\n\s{4}"name": ")(.*?)(")/gm,
      `$1${answers.bot}$3`
    )
  }
  if (answers.author || answers.email) {
    let author = answers.author ? answers.author : ''
    if (answers.email) author += `<${answers.email}>`
    await replaceInFile(
      './package.json',
      /^(\s\s"author":\s")(.*?)(")/gm,
      `$1${author}$3`
    )
  }
  if (answers.env) {
    const env = `BOT_LOG_LEVEL=debug\rBOT_NAME=bot\rBOT_ALIAS=bb\rBOT_SHELL_USER_NAME=user\rBOT_SHELL_USER_ID=111\rBOT_SHELL_ROOM=shell`
    await writeFile('.env', env, { encoding: 'utf8', flag: 'w' })
  }
})
