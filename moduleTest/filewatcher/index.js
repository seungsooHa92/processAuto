const fs = require('fs');
const util = require('util');
const debounce = require('debounce');
const events = require('events');
const EventEmitter = events.EventEmitter;

let outOfFileHands = false;

module.exports = (opts) =>{
    return new FileWatcher(opts);
}

let FileWatcher = (opts)=>{
    /*
        option값이 없을때 
        초기값 설정해주는 부분ㅇ
    */
    if(!opts) opts={}
    if(opts.debounce === undefined) opts.debounce = 10
    if(opts.persistent === undefined) opts.persistent = true
    if(!opts.interval) opts.interval = 1000;

    this.polling = opts.forcePolling;
    this.opts = opts
    this.wathcers = {}
}

util.inherits(FileWatcher, EventEmitter)