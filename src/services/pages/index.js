const request = require('request');
const cheerio = require('cheerio')
const URL = require('url');


const fetchPage = (url) => {
  return new Promise((success, fail) => {
    request(url, function (error, response, body) {
      if (error) fail(error)
      else success(body)
    });
  })
}

const processHtml = (url, html) => {
  const $ = cheerio.load(html)

  q = URL.parse(url)
  const baseUrl = `${q.protocol}//${q.host}/${q.pathname.split('/')[1]}`
  $('head').prepend(`<base href="${baseUrl}"></base>`)

  $('*').removeAttr('onclick')
  $('*').removeAttr('onsubmit')
  $('*').removeAttr('onmouseover')
  $('*').removeAttr('onscroll')


  $('script').remove()

  return $.html()
}

exports.fetchPage = fetchPage
exports.processHtml = processHtml
