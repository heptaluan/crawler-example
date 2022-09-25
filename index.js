const http = require('http'),
  fs = require('fs'),
  cheerio = require('cheerio'),
  request = require('superagent'),
  xlsx = require('node-xlsx')

let page = 1,
  list = [],
  start = '',
  fetchPage = () => {
    start()
  }

start = () => {
  request
    // .get(`https://www.qikanchina.com/search/n${page}?q=%E5%B0%8F%E5%AD%A6%E6%95%B0%E5%AD%A6&field=&year=2021`)
    // https://www.qikanchina.com/search/n2?q=%E5%B0%8F%E5%AD%A6%E9%81%93%E5%BE%B7%E4%B8%8E%E6%B3%95%E6%B2%BB&t=0&year=2021
    .get(`https://www.qikanchina.com/search/n${page}?q=%E5%B0%8F%E5%AD%A6%E9%81%93%E5%BE%B7%E4%B8%8E%E6%B3%95%E6%B2%BB&t=0&year=2021`)
    .end((err, res) => {
      if (!err) {
        let html = res.text,
          $ = cheerio.load(html, { decodeEntities: false }),
          $content = $('.list-cont').find('.list-item')
        len = $content.length

        if (len > 0) {
          if (page > 101) {
            return
          }
          page++
          $content.each((i, e) => {
            let data = [],
              $e = $(e)

            const str = $e.find('.size-icon:last-child').text().trim()
            if (/[0-9]/.test(str) && $e.find('.user-icon').find('a').length === 1 && str
            .split(' ').filter(n => n).find(item => item.includes('机构：'))) {
              data.push(str.replace(/[^\d]/g, ''))
              data.push(
                str
                .split(' ').filter(n => n).find(item => item.includes('机构：'))
                  // .match(/[\u4e00-\u9fa5]/g)
                  // .join('')
                  .replace('（', '')
                  .replace('）', '')
                  .replace('机构', '')
                  .replace('：', '')
                  .replace(/[0-9]/g, '')
              )
              data.push(
                $e
                  .find('.user-icon')
                  .find('a')
                  .text()
                  .match(/[\u4e00-\u9fa5]/g)
                  .join('')
                  .replace('作者', '')
              )
              data.push($e.find('.time-icon').text().trim().replace('创建时间：', ''))
            }
            if (data.length !== 0) {
              list.push(data)
            }
          })
          writeExcel('test', list)
        }
      } else {
        console.log('Get data error !')
      }
    })
}

var offset = 0

function writeExcel(name, data) {
  var buffer = xlsx.build([{ name: 'sheet1', data: data }])
  fs.writeFile('./' + name + '.xlsx', buffer, (err) => {
    if (err) throw err
    setTimeout(function () {
      offset += 20
      console.log(offset)
      start()
    }, 200)
  })
}

fetchPage()
