import $ from 'jquery'

class TabList {
  constructor (game) {
  	this.game = game
  	this.lastHTML
  }

  update (players) {
  	let newHTML = ''
  	if (players !== undefined && JSON.stringify(players) !== '{}') {
  		for (const i in players) {
  			newHTML += `<div class="tab_player clearfix">
				<span class="float-left">${i}</span>
				<span class="float-right">${players[i].ping}ms</span>
			</div>`
  		}
  		if (newHTML != this.lastHTML) {
  			// console.log(players)
  			this.lastHTML = newHTML
  			$('.tab_list').html(this.lastHTML)
  		}
  	}
  }
}
export { TabList }
