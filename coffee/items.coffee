request = require 'request'
JSSoup = require('jssoup').default
fs = require 'fs'
http=require "http"
https=require "https"

options = {
  method: 'GET'
  url: "https://www.digminecraft.com/lists/item_id_list_pc.php"
  encoding: "utf-8"
}

request options, (err, response, body)->
  soup=new JSSoup(body)
  map={}
  last=null
  for i in soup.findAll("td")
    if (i.text isnt "&nbsp;") and (i.text.includes "minecraft:")
      title=i.text.split("(")[0]
      war=0
      for j in [0..i.text.length-1]
        if i.text[j] is "("
          war=j
      type=(i.text.substr war+11).split(")")[0]
      console.log type,last
      ((type,url)->
        file=fs.createWriteStream "#{__dirname}/client/assets/items/#{type}.png"
        https.get url,(response)->
          response.pipe(file)
      )(type,"https://www.digminecraft.com#{last}")
    else if i.find("img") isnt undefined
      last=i.find("img").attrs["data-src"]
  return
