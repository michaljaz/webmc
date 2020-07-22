//Terrain worker


const handlers = {
  setVoxel

};
 
self.onmessage = function(e) {
  const fn = handlers[e.data.type];
  if (!fn) {
    throw new Error('no handler for type: ' + e.data.type);
  }
  fn(e.data);
};

function setVoxel(data){
	postMessage("Set voxel on "+data.data)
}