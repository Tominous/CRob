/**
 * Client Extentions Allows Other Extentions, Modules Or Other Services
 * To Interface With A Read-Only Version Of The Client, By Polling The
 * Client Every Time An Event Is Triggered, Keeping The Client Obkect
 * Stored, Up To Date!
 */


var events = require('events');
var clientEmitter = new events.EventEmitter();

var client = false;

module.exports = {

    clientUpdate: function(_client) {
        
        if(client != false) {
            if(_client.id != client.id) return;
            //Do More Checks!!
        }
        
        client = _client;
    },

    clientGet: function() {
        return client;
    },

    clientAction: function(action) {
        clientEmitter.emit('action', action);
    }, 

    clientEmitter: clientEmitter

    /**
    * TODO:
    * Add an event listner things for important events such as:
    * - GuildMemberAdd / Remove
    * - GuildAdd / Remove
    */

}