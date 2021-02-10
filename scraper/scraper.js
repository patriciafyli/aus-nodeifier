const axios = require('axios'); // Promise-based HTTP client for Node.js and the browser
const cheerio = require('cheerio'); // jQuery implementation for Node.js. Cheerio makes it easy to select, edit, and view DOM elements.
// const Diff = require('text-diff'); // Where is this supposed to go?
fs = require('fs'); // does it need to be const?
const Diff = require('text-diff'); // Where is this supposed to go? Learn about variable scopes in Node

const url = 'https://covid19.homeaffairs.gov.au/i-want-apply-visa';
const contentsFile = 'contents.txt'
var prevContents = readFile(contentsFile)

// using Twilio SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs
const sgMail = require('@sendgrid/mail')
// npm install --save @sendgrid/mail

axios(url)
  .then(response => {
    const html = response.data;
    const $ = cheerio.load(html);

    var currentContents = $('p').text() // do I want to just have the whole html?

    if (prevContents != currentContents) {
      console.log('Page contents have changed; sending email notification')

      writeFile(contentsFile, currentContents) // what does the callback do? understand this

      let diffHtml = getDiffHtml(prevContents, currentContents) // TODO: Make this prettier

      sendEmail('patricia.fy.li@gmail.com', 'li.patricia@protonmail.com', 'Australian Visa Page Updated', url, diffHtml)
    }
    else {
      console.log('Page contents the same as last checked')
      return 0
    }
  })
  .catch(console.error);

  function sendEmail(recipient, sender, subject, text, html) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    const msg = {
      to: recipient,
      from: sender,
      subject: subject,
      text: text, // format this?
      html: html,
    }
    sgMail
      .send(msg)
      .then(() => {
        console.log('Email sent')
      })
      .catch((error) => {
        console.error(error)
      })
  }

  function readFile(filename) { // omg how to return things with callbacks???
    fs.readFile(contentsFile, 'utf8', (err, data) => { // => signifies mapping; (err, data) 
      if (err) {
        console.error(err)
        return
      }
      prevContents = data
    })
  }

  function writeFile(filename, data) { // does [] mean optional? like =None in python?
    fs.writeFile(filename, data, function (err) { // understand this callback
      if (err) return console.log(err);
    }); // TODO: add error handling?
  }

  function getDiffHtml(text1, text2) {
    var diff = new Diff(); // options may be passed to constructor; see below
    var textDiff = diff.main(text1, text2); // produces diff array
    var html = diff.prettyHtml(textDiff); // produces a formatted HTML string

    return html
  }

// TODO: Use twilio to email myself based on return code