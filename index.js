/**
 * WorkFlow Enhance
 *
 * Copyright Tmax CQA2 seungsooHa
 *
 * The contents are subject to the Creative Commons Attribution-ShareAlike
 * License. It is allowed to copy, distribute, transmit and to adapt the work
 */

/**
 * i.Module Import
 */
const figlet = require('figlet');
const notifier = require('node-notifier');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const chalk = require('chalk');
const puppeteer = require('puppeteer');
const commander = require('commander');
const toast = require('powertoast');
const path = require('path');
const _ = require('lodash');
const inquirer = require('inquirer');
const got = require('got');
const {
start_prompt,
Date_formatting
} = require('./default_setting');
const {accountInfo} = require('./credential_data');

const {
emptyFlag,
//completeNoti
} = require('./common_dataset');

const {

createCustomNoti,
classifyMail,
first_execute,
after_execute,
page_scrapper,
jsonFileWrite,
imageFileWrite,
traverseIMSPage,
handle_newIssue
} = require('./common_function');

const UNREAD = "읽지 않음 ";
const SEND = "전달 됨 ";
let cnt = 0;
const dev_MAIL_POLLINGTIME = 270*1000; 
const MAIL_POLLINGTIME = 300*1000;


let isEnter = false
/**
 * 
 *  ----------------------------------------------------------------------------------------------------------------------
 * 
 *  @function check_mailInfo
 *
 *  @param page: page = mailPage
 *  @param content: unReadMail Noti Click -> get Information of Mail (Notification Object[optiions ]...) 
 *  @param browser: browser that created in mainRunner
                    
 *  @param 

 *  @description
 *  <pre>
 *      i. unRead Mail 에 대한 Notification 클릭시 
 *      ii. 해당 메일 내용과 issue 번호를 가진 issue를 IMS에 접속하여 (page객체 생성) 이슈내용 및 히스트로 확인함
 *  	
 *  </pre>
 *  
 *  -----------------------------------------------------------------------------------------------------------------------
 */
const check_mailInfo = async(page=mailPage,mailId,content,browser)=>{

    console.log(chalk.yellowBright('@@@@@@@@@@@   Mail Info   @@@@@@@@@@@'));
    console.log(chalk.magentaBright(`<< check_mailInfo >> : ${content}`));
    console.log(chalk.magentaBright(`<< check_mailID Info >> : ${mailId}`));
    console.log(chalk.yellowBright('@@@@@@@@@@@   Mail Info   @@@@@@@@@@@'));
    let origin_ = content;
    let splitted = origin_.split(' ');
    let class_flag = splitted[0]; // IMS
    let class_flag2 = splitted[1]; // No.123456
    let _No = class_flag2.split('.')[0]; // No ---

    let _status = splitted[2];
    /*

    Registered -> New Issue Register;
    Action Registered -> Action is Submitted;
    Action Modified 
    Status Changed -> only Status changed
    */
    let _imsNum = class_flag2.split('.')[1];  // Issue Number
    let imsTargetURL = `https://ims.tmaxsoft.com/tody/ims/issue/issueView.do?issueId=${_imsNum}`
   
    switch(class_flag){

        case "[IMS]":
            console.log('[IMS] mail received ...');
            if(_No == "No"){
                // Issue 관련된 메일일때 imsPage 생성후 처리 
                const imsPage = await browser.newPage();

                await page.setViewport({//set Page viewPort
                    width : 1920,               
                    height : 1080,               
                });
                if(_status === 'Registered'){// New Issue Registered
                    console.log('New Issue Registered!!');

                    /*
                    TODO 
                    ******* New Issue Registered

                    1. check whether it is first connection to IMS if(!isEnter){} else{}
                    then
                    2. handle_newIssue
                    */ 
                    if(!isEnter){
                        console.log(chalk.yellowBright('***** [New Issue Registered] first Noti Click *****'));
                        await first_execute(imsPage,_imsNum);
                        await handle_newIssue(imsPage); 
                       
                    }
                    else{
                        console.log(chalk.greenBright('***** [New Issue Registered] After first Noti Click ******'));
                        await after_execute(imsPage,_imsNum);
                        await handle_newIssue(imsPage); 
                       
                    }
                }
                else{
                    // Already Handled Issue
                    if(!isEnter){
                        console.log(chalk.yellowBright('***** first Noti Click *****'));
                        await first_execute(imsPage,_imsNum);
                        await traverseIMSPage(imsPage,imsTargetURL,browser);
                    }
                    else{
                        console.log(chalk.greenBright('***** After first Noti Click ******'));
                        await after_execute(imsPage,_imsNum);
                        await traverseIMSPage(imsPage,imsTargetURL,browser);
                    }
                }
            } 
            break
        case "오늘의":
            console.log('IT news')
            break

        default:
            // 현재 버전에서는 IMS 메일이 아닌 다른 noti 클릭시 빈 page가 생성함 
            // 해당 현재 함수 checkMail Info 수행시 무조건적으로 page 생서하는 라인 수정 필요함 
            console.log(chalk.redBright(`Unclassified Mail [현재는 IMS 이슈 메일만 분류 되어있음]`));
    }
    isEnter =true
}
/** 
 * 
 *  ----------------------------------------------------------------------------------------------------------------------
 *  @function mailMonitoring
 *  @param page: mainRunner에서 생성한 mailPage를 받아온다.
 *  @param browser: mainRunner에서 생성된 puppeteer browser 객체를 받아옴.
 *  @param 
 *  @param 

 *  @description
 *  <pre>
 *      i. unRead Mail 에 대한 Notification 클릭시 
 *      ii. 해당 메일 내용과 issue 번호를 가진 issue를 IMS에 접속하여 (page객체 생성) 이슈내용 및 히스트로 확인함
 *  	
 *  </pre>
 *  
 *  -----------------------------------------------------------------------------------------------------------------------
 */
const mailMonitoring = async(page,browser)=>{
    console.time(`[mailMonitoring] executed         ....`);
    
    // current Mail page -> get All Mail List
    let readList = await page.$$eval(('td.subject'), readList => readList.map(ele=>ele.innerText));
    // current Mail page -> get Mail Status
    let unReadList = await page.$$eval(('td.subject'), readList => readList.map(ele=>ele.children[0].title));
    /*
        mailPage Enter  
        i.   page Evaluate get All Selector which have tr Selector
        ii.  splice(2) => eliminate 제목 .. unnecessary things
        iii. mail_tr_id = []  : it is all id List and Return Promise
    */
    let get_trId = await page.evaluate(()=>{
        let origin_tr = document.querySelectorAll('tr');
        let og_tr = Array.from(origin_tr);
        let mail_tr = og_tr.splice(2);
        let mail_tr_id = [];
        mail_tr.forEach((ele)=>{
            mail_tr_id.push(ele.id);
        })
        return Promise.resolve(mail_tr_id);  
    })
    console.log(chalk.yellowBright(`--------------------------------------------------  Current Total Mail List  --------------------------------------------------`));
    console.log(readList);
    console.log(chalk.yellowBright(`--------------------------------------------------  Current Total Mail List  --------------------------------------------------`));
    console.log(chalk.cyanBright(`--------------------------------------------------  Detect Mail Status List  -------------------------------------------------`));
    console.log(unReadList);
    console.log(chalk.cyanBright(`--------------------------------------------------  Detect Mail Status List  -------------------------------------------------`));
    // mail Id
    mail_id = await get_trId;
    console.log(chalk.magentaBright(`--------------------------------------------------  Detect Mail Status List  -------------------------------------------------`));
    console.log(mail_id);
    console.log(chalk.magentaBright(`--------------------------------------------------  Detect Mail Status List  -------------------------------------------------`));
    //----------------------------------------------------------------------------------------------------------------------
    let completeNotiRandomId = Math.round(Math.random() * 0xffffff).toString(16); // Notification 별로 unique 한 id값 부여 
    if(!unReadList.includes(UNREAD)){

        let completeOption =  {
            title:`MAIL check Complete!`,
            message :'메시지 확인 완료',
            icon: path.join(__dirname,'/res/images/complete.png'),
            id: completeNotiRandomId,
            sound:true,
            wait : true,        
        }
        let completeNotiClickFn = (notifierObj,options,event)=>{
            //console.log(notifierObj,options,options.id);
            console.log('메일 확인 완료 noti Click');
        }
        // make complete Check Noti

        createCustomNoti(completeOption, true, completeNotiClickFn);
    }
    for(let i = 0 ; i < unReadList.length ; i ++){
        /*
        package issue (notifier onClick do not wrork)
        1.https://stackoverflow.com/questions/62193525/how-can-i-listen-click-event-on-windows-notifications
            -> npm i node-powertoast => Windowws.winmd ->  (https://github.com/NodeRT/NodeRT/issues/65#issuecomment-303938757)
        
        **
        2.https://github.com/mikaelbr/node-notifier/issues/291#issuecomment-555741924
            -> node-notifer rollback 함
        */
        let unReadNotiRandomId = Math.round(Math.random() * 0xffffff).toString(16); // Notification 별로 unique 한 id값 부여 
        if(unReadList[i] == '읽지 않음 '){
            let unReadOption =  {
                title: 'Unread Alarm ',
                w:true,
                id : unReadNotiRandomId,
                message: `${readList[i]}`,
                messageId : `${mail_id[i]}`,
                icon: path.join(__dirname, '/res/images/bell.png'), // Absolute path (doesn't work on balloons)
                sound: true, // Only Notification Center or Windows Toasters
                wait: false // Wait with callback, until user action is taken against notification, does not apply to Windows Toasters as they always wait or notify-send as it does not support the wait option
            }
            let unReadNotiClickFn = async (notifierObj,options,event)=>{

                console.log(chalk.bgYellowBright('UnRead Mail Clicked '));
                /* 
                    unRead Mail and it is IMS Mail 
                    go to Ims Page
                */
                check_mailInfo(page, options.messageId, options.message , browser);
            }
            /*
                20.11.05
                every alarm -> new Noti (not duplicated)
            */
            createCustomNoti(unReadOption, true, unReadNotiClickFn);
        }     
        // forwarding한 메일 처리 
        if(unReadList[i] == '전달됨 '){
           console.log('Forwarding 한 메일')
        }
    }
    console.timeEnd(`[mailMonitoring] executed         ....`);

}
/**
 * 
 *  ----------------------------------------------------------------------------------------------------------------------
 * 
 *  @function mainRunner
 *  @param 

 *  @description
 *  <pre>
 *      i. browser -> puppeteer launch
 *      ii. page 객체 생성 (mail 화면을 담는 mailPage) -> mail url 접속
 *      iii.
 *  </pre>
 *  
 *  -----------------------------------------------------------------------------------------------------------------------
 */
   
const mainRunner = async(_headless)=>{

    // String to Bool
    let headlessMode = (_headless === 'true')

    const browser = await puppeteer.launch({
        headless: headlessMode, 
    });

    let i = 0 ;
    while(true){
        /*
            mail Server 의 session control 문제 때문에 
            mailPage를 Close 하고 다시 키는 loop 문으로 문제 해결 
            해당 프로그램을 계속 실행할시 시간이 어느정도 경과시 session 끊기는 현상 우회 
        */
        i++;
        const mailPage = await browser.newPage();
        await mailPage.setViewport(
            {
            width : 1920,               
            height : 1080,               
            deviceScaleFactor: 1,
            }    
        );
        //await mailPage._client.send('Emulation.clearDeviceMetricsOverride');
        await mailPage.goto('https://mail.tmax.co.kr/');

        if(i == 1){
            // first enter -> login 
            await mailPage.type('#rcmloginuser',accountInfo._id,{delay:20});
            await mailPage.type('#rcmloginpwd',accountInfo._pw,{delay:20});
            await mailPage.$(`#rcmloginsubmit`).then((result)=>{
                result.click();
            });
            await mailPage.waitForSelector("#rcmbtn107");
           
        }
        console.log(chalk.greenBright(figlet.textSync(`** Load Mail List **`,{ width : 110} )));
        
        await mailPage.waitForTimeout(1500);
        await mailMonitoring(mailPage,browser);
        await mailPage.waitForTimeout(dev_MAIL_POLLINGTIME);
        //await mailPage.reload({ waitUntil: ["networkidle0"] });
        await mailPage.close();    
    }   
}
/**
 *  -----------------------------------------------------
 *  @description
 *  <pre>
 *      before operate mainRunner
 *      set preCondition
 *          ex >
 *              Headless Mode (T/F)    
 *  </pre>
 *  -----------------------------------------------------
 */
inquirer
    .prompt([
        {
		    type: 'list',
		    name: 'head',
		    message: 'Work Process Automation Run! choose your Headless Mode [T/F] default is true',
		    choices: ['true', 'false'],
        },
        {
            type: 'checkbox',
		    name: 'screenshot',
		    message: 'You want ScreenShot IMS Page ?',
		    choices: ['true', 'false'],
        }
    ])
    .then((answers) => {
	    console.log(chalk.green('[Headless Mode] is :',answers.head));
        mainRunner(answers.head);
    })



