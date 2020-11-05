const nn = require('node-notifier');


const createCustomNoti = (options,isClick,clickFn)=>{

    let noti = new nn.WindowsToaster();
    noti.notify(options);

    if(isClick){
        /*
        event binding => noti.on(`click`)
        */     
        noti.on('click',clickFn);
    }
}


module.exports = {

    createCustomNoti
}