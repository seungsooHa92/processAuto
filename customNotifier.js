/*
const { metadata } = require('figlet');

const NotificationCenter = require('node-notifier').NotificationCenter;

var notifier = new NotificationCenter({
    withFallback:false,
    customPath: undefined

});
*/


const { metadata } = require('figlet');

/*
const notifier = require('node-notifier');

notifier.notify(
    {
    title: 'this is title',
    subtitle: 'this is subtitle',
    message: 'this is message',
    sound : false,
    icon : '',
    contentImage : undefined,
    open: undefined, // URL open to on Click
    wait: true,
    timeout : 5,
    closeLabel : 'closeLabel',
    actions : 'actions',
    dropdownLabel : 'dropDownLabel',
    reply: false
    },
    function(error,response){
        console.log(response);
    }



)
*/

var options =  {
    title: 'this is title',
    subtitle: 'this is subtitle',
    message: 'this is message',
    sound : false,
    icon : '',
    contentImage : undefined,
    open: undefined, // URL open to on Click
    wait: true,
    timeout : 5,
    closeLabel : 'closeLabel',
    actions : 'actions',
    dropdownLabel : 'dropDownLabel',
    reply: false
    }
const nn = require('node-notifier');

//X new nn.NotificationCenter(options).notify()
//X new nn.NotifySend(options).notify();
//O new nn.WindowsToaster(options).notify(options);
//O new nn.WindowsBalloon(options).notify(options);
//Xnew nn.Growl(options).notify(options);

var opt =  {
            title:`Check Complete!`,
            message :'메시지 확인 완료',
            icon: path.join(__dirname,'/res/images/complete.png'),
            sound:true,
            wait : true,        
        },
       
        
       
        