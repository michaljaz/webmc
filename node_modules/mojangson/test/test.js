var assert=require("assert");
var mojangson=require("../");

describe("mojangson",function(){
  var data=[
    ['{}',{}],
    ['{key:value}', {key:"value"}],
    ['{key:"value"}', {key:"value"}],
    ['{key:"va,lue"}', {key:"va,lue"}],
    ['{k1:v1,k2:v2}', {k1:"v1", k2:"v2"}],
    ['{number:0s}', {number:0}],
    ['{number:35.765d}', {number:35.765}],
    ['{number:35i}', {number:35}],
    ['{number:123b}', {number:123}],
    ['{nest:{}}', {nest:{}}],
    ['{nest:{nest:{}}}', {nest:{nest:{}}}],
    ["{id:35,Damage:5,Count:2,tag:{display:{Name:Testing}}}", {id:35,Damage:5,Count:2,tag:{display:{Name:"Testing"}}}],
    ['{id:"minecraft:dirt",Damage:0s,Count:1b}', {id:"minecraft:dirt",Damage:0, Count:1}],
    ['{key:value,}', {key:"value"}],
    ['[0:v1,1:v2]', ["v1","v2"]],
    ['[0:"§6Last Killed: None",1:"§6Last Killer: None",2:"§6Rank: §aNovice-III",3:"§6§6Elo Rating: 1000",' +
    ']',
      ["§6Last Killed: None","§6Last Killer: None","§6Rank: §aNovice-III","§6§6Elo Rating: 1000"]],

    ['{id:1s,Damage:0s,Count:1b,tag:{display:{Name:"§r§6Class' +
    ': Civilian",Lore:[0:"§6Last Killed: None",1:"§6Last Killer: None",2:"§6Rank: §aNovice-III",3:"§6§6Elo Rating: 1000",' +
    '],},},}',
      {id:1,Damage:0, Count:1,tag:{display:{Name:"§r§6Class: Civilian",Lore:["§6Last Killed: None","§6Last Killer: None","§6Rank: §aNovice-III","§6§6Elo Rating: 1000"]}}}],
    ["[1,2,3]",[1,2,3]],
    ["[1,2,3,]",[1,2,3]],
    ['[]',[]],
  ];
  data.forEach(function(a){
    it("should be equal",function(){
      assert.deepEqual(mojangson.parse(a[0]),a[1]);
    });
  });
});