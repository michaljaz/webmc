import * as THREE from "../../build/three.module.js";
import {FBXLoader} from '../loaders/FBXLoader.js';
import {Tools} from './tools.js'
class AssetLoader{
  constructor(options){
    this.assets={}
  }
  load(assets,callback,_this){
    var textureLoader = new THREE.TextureLoader();
    var fbxl = new FBXLoader();
    var assetsNumber=0;
    var assetsLoaded=0;

    Object.keys(assets).forEach(function (p){
      assetsNumber++;
    })
    Object.keys(assets).forEach(function (p){

      var type=assets[p].type;
      var path=assets[p].path;
      var dynamic=assets[p].dynamic;
      if(dynamic){
        path+="?"+Tools.uuidv4()
      }
      if(type=="texture"){
        textureLoader.load(path,function (texture){
          _this.assets[p]=texture
          assetsLoaded++;
          if(assetsLoaded==assetsNumber){
            callback()
          }
        })
      }
      if(type=="text"){
        $.get(path,function (data){
          _this.assets[p]=data
          assetsLoaded++;
          if(assetsLoaded==assetsNumber){
            callback()
          }
        })
      }
      if(type=="image"){
        var img = new Image;
        img.onload=function (){
          _this.assets[p]=img
          assetsLoaded++;
          if(assetsLoaded==assetsNumber){
            callback()
          }
        }
        img.src=path;
      }
      if(type=="fbx"){
        fbxl.load(path,function (fbx){
          _this.assets[p]=fbx
          assetsLoaded++;
          if(assetsLoaded==assetsNumber){
            callback()
          }
        })
      }
    })
    return this;
  }
  get(assetName){
    return this.assets[assetName]
  }
}
export {AssetLoader}