const path = require('path');

const emptyFlag = [

"", "", "", "", "", "",
"", "", "", "", "", "", 
"", "", "", "", "", "", 
"", "", "", "", "", "", 
"", "", "", "", "", "",
 "", "", "", "", "", "", 
"", "", "", "", "", "", 
"", "", ""

];

const completeNoti = {
    title: `Check Complete!`,
    message: '메시지 확인 완료',
    icon : path.join(__dirname,'/res/images/complete.png'),


}


module.exports = {
    emptyFlag
}