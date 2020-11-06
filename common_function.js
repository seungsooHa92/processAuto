const nn = require('node-notifier');
const _id = `seungsoo_ha`;
const _pw = `S1s1s1s1!`;
const __pw = `S1s1s1s1s1!`;
const chalk = require('chalk');


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

const imsFirst = async(page)=>{

    await page.type('#id',_id,{delay:20});

    /*
    puppeteer에서 input태그 처리하는 방법 
    reference : https://github.com/puppeteer/puppeteer/issues/441
    */  
    await page.evaluate(()=>{
        document.querySelector(`body > form > table > tbody > tr > td > table > tbody > tr:nth-child(2) > td:nth-child(1) > table > tbody > tr > td:nth-child(2) > table > tbody > tr > td:nth-child(2) > table > tbody > tr > td:nth-child(2) > input[type=password]`)
        .select();
    })
        
    await page.keyboard.type(__pw);

    await page.evaluate(()=>{
        document.querySelector(`body > form > table > tbody > tr > td > table > tbody > tr:nth-child(2) > td:nth-child(1) > table > tbody > tr > td:nth-child(2) > table > tbody > tr > td:nth-child(2) > table > tbody > tr > td:nth-child(3) > input[type=image]`)
        .click();
    })



}
const classifyMail = async(content,browser)=>{


    console.log(chalk.magentaBright(`[check_mailInfo] : ${content}`));

    let origin_ = content;
    let splitted = origin_.split(' ');
    
    const imsPage = await browser.newPage();
    await imsPage.setViewport({//set Page viewPort
        width: 1920,
        height: 1080,
        deviceScaleFactor: 1,
    });

    let class_flag = splitted[0]; // IMS
    let class_flag2 = splitted[1]; // No.123456
    let _No = class_flag2.split('.')[0];
    let _imsNum = class_flag2.split('.')[1];
    switch(class_flag){

        case `[IMS]`:
            console.log('[IMS] mail received ...');
            if(_No == "No"){
                if(!cnt){
                    await imsPage.goto(`https://ims.tmaxsoft.com/tody/ims/issue/issueView.do?issueId=${_imsNum}`);
                    imsFirst(imsPage);
                }   
                await imsPage.goto(`https://ims.tmaxsoft.com/tody/ims/issue/issueView.do?issueId=${_imsNum}`);
                
            } 

        default:
            console.log(`Unclassified Mail [현재는 IMS 이슈 메일만 분류 되어있음]`);
    }


    cnt++

}



module.exports = {
    createCustomNoti,
}