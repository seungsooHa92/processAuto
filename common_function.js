const notifier = require('node-notifier');


const makeCustomAlarm = (title_,msg_,icon_,isClick,clickFn)=>{
    notifier.notify(
    {
        title: title_,
        message : msg_,
        icon: icon_,
        sound:true,
        wait : true,        
    },
    function(err,response){},
        // Response is reponse form notification
    );
    if(isClick){
        notifier.on('click',(notifireObj,options)=>{
            //noti Click시 동작할 콜백 함수 
            clickFn();
        })

    }


}

module.exports = {

    makeCustomAlarm

}
