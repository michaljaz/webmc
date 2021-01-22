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

removeBg=()->
  replaceColor = require 'replace-color'
  fs=require "fs"

  removeBg=(filePath)->
    replaceColor {
      image: filePath
      colors: {
        type: 'rgb'
        targetColor: [139, 139, 139]
        replaceColor: [0,0,0,0]
      }
    }, (err, jimpObject)->
      if err
        return console.log err
      jimpObject.write filePath, (err) ->
        if err
          return console.log err

  dir_path="#{__dirname}/../client/static/assets/items/"
  fs.readdir dir_path, (err, files)->
    files.forEach (file)->
      filePath="#{__dirname}/../client/static/assets/items/"+file
      removeBg filePath
      return
    return

request options, (err, response, body)->
  soup=new JSSoup(body)
  map={}
  last=null
  ile=0
  zal=0
  for i in soup.findAll("td")
    if (i.text isnt "&nbsp;") and (i.text.includes "minecraft:")
      ile+=1
      title=i.text.split("(")[0]
      war=0
      for j in [0..i.text.length-1]
        if i.text[j] is "("
          war=j
      type=(i.text.substr war+11).split(")")[0]
      ((type,url)->
        file=fs.createWriteStream "#{__dirname}/../client/static/assets/items/#{type}.png"
        https.get url,(response)->
          console.log type,url
          response.pipe(file)
          zal+=1
          if ile is zal
            console.log("Removing gray backgrounds...")
            removeBg()
      )(type,"https://www.digminecraft.com#{last}")
    else if i.find("img") isnt undefined
      last=i.find("img").attrs["data-src"]
  return
