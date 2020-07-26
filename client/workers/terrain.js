//Terrain worker

//wait for data

const handlers = {
  setVoxel,
  init
};

var State={
	blocks:null,
	blocksMapping:null,
}


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
function init(data){
	console.log(data)
	State.blocks=data.data.blocks;
	State.blocksMapping=data.data.blocksMapping;
}