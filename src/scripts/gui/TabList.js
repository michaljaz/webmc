import $ from 'jquery'
import { antiXSS } from './../additional/tools.js'
class TabList {
  constructor (game) {
    this.game = game
    this.lastHTML = ''
  }

  update (players) {
    let newHTML = ''
    if (players !== undefined && JSON.stringify(players) !== '{}') {
      for (const i in players) {
        newHTML += `<div class="tab_player clearfix"><span class="float-left">${antiXSS(i)}</span><span class="float-right">${players[i].ping}ms</span></div>`
      }
      if (newHTML !== this.lastHTML) {
        this.lastHTML = newHTML
        $('.tab_list').html(this.lastHTML)
      }
    }
  }
}
export { TabList }
