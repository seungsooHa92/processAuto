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

const {
emptyFlag,
//completeNoti
} = require('./common_dataset');

const {

createCustomNoti,
classifyMail,
first_execute,
after_execute,
page_scrapper

} = require('./common_function');

const _id = `seungsoo_ha`;
const _pw = `S1s1s1s1!`;
const __pw = `S1s1s1s1s1!`;
const UNREAD = "읽지 않음 ";
const SEND = "전달 됨 ";
let cnt = 0;
const dev_MAIL_POLLINGTIME = 60*1000; 
const MAIL_POLLINGTIME = 300*1000;


let isEnter = false

/**
 * 
 *  ----------------------------------------------------------------------------------------------------------------------
 * 
 *  @function check_mailInfo
 *
 *  @param page: mailPage를 받아옴
 *  @param content: 안읽은 메일 알람 notification 클릭시 받아오는 메시지 값 
 *  @param browser: mainRunner에서 생성된 puppeteer browser 객체를 
                    받아옴.
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
    /*
    message format
    '[IMS] No.243229 Action Registered : [NH투자증권] PromanagerOPS 느린 현상 개선 요청 (이슈분리:240190)',
    '[어린이집 공지] 2021년도 Tmax 사랑 어린이집 원아모집 안내',
    */
    
    console.log(chalk.yellowBright('@@@@@@@@@@@   Mail Info   @@@@@@@@@@@'));
    console.log(chalk.magentaBright(`<< check_mailInfo >> : ${content}`));
    console.log(chalk.magentaBright(`<< check_mailID Info >> : ${mailId}`));
    console.log(chalk.yellowBright('@@@@@@@@@@@   Mail Info   @@@@@@@@@@@'));


    let origin_ = content;
    let splitted = origin_.split(' ');
    let class_flag = splitted[0]; // IMS
    let class_flag2 = splitted[1]; // No.123456
    let _No = class_flag2.split('.')[0]; // No ---
    let _imsNum = class_flag2.split('.')[1];  // Issue Number
    let imsTargetURL = `https://ims.tmaxsoft.com/tody/ims/issue/issueView.do?issueId=${_imsNum}`


    /* 
    mailPage 에서 안 읽은 메일함 리스트를 클릭하려고 했음
    
    await page.click(`#${mailId}`,{clickCount:5 }).then((result)=>{
        console.log('mail page double Clicked')
    });    
    await page.waitForSelector('#messagetoolbar');
    await page.waitForTimeout(500);
   */


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
                /*
                TODO
                    issue data post To Server(through got package);
                    if else -> need to change Clean Code

                */
                if(!isEnter){

                    console.log(chalk.yellowBright('***** first Noti Click *****'));
                    await first_execute(imsPage,_imsNum);
                    // await imsPage.waitForNavigation({waitUntil:'networkidle0'});
                    let _getIssueData = await page_scrapper(imsPage,imsTargetURL);

                    await got.post('http://192.168.17.36:5000/puppeteer_', {
                        json: {
                            _getIssueData
                        },
                        responseType: 'json'
                    });

                }
                else{
                    console.log(chalk.greenBright('***** After first Noti Click ******'));
                    await after_execute(imsPage,_imsNum);
                    //await imsPage.waitForNavigation({waitUntil:'networkidle0'});
                    await page_scrapper(imsPage,imsTargetURL);
                    let _getIssueData = await page_scrapper(imsPage,imsTargetURL);

                    await got.post('http://192.168.17.36:5000/puppeteer_', {
                        json: {
                            _getIssueData
                        },
                        responseType: 'json'
                    });
                }
            } 
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
 * 
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
    
    /* 
    axios not used (got)
    
    await axios.get(`https://mail.tmax.co.kr/?_task=mail&_mbox=INBOX`)
        .then((response)=>{
            const html = response.data;
            const $ = cheerio.load(html);
            const mailSubject = $(` td.subject > a `);
            console.log(mailSubject);
        })
        .catch((error)=>{
            console.log(error);
         })
    */

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
            //console.log(notifierObj);
            //console.log(options);
            //console.log(options.id);
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
            createCustomNoti(unReadOption, true, unReadNotiClickFn);
            /*

                20.11.05
                notifier 객체를 분기처리 안에서 동일한 객체로 선언했기때문에 
                다수의 notifier가 생성되었고
                click콜백 내부에서 page객체 생성이 비정상적으로 발생한 문제 해결 
        
            notifier.notify(
            {
                title: 'Unread Alarm ',
                w:true,
                message: `${readList[i]}`,
                icon: path.join(__dirname, '/res/images/bell.png'), // Absolute path (doesn't work on balloons)
                sound: true, // Only Notification Center or Windows Toasters
                wait: false // Wait with callback, until user action is taken against notification, does not apply to Windows Toasters as they always wait or notify-send as it does not support the wait option
            },
            function (err, response) {
            // Response is response from notification
                if(err){
                    console.error(err);
                    return;
                }
                if( response.trim().toLowerCase() === 'activated'){
                    //clicked   
                }
               
            });

           
            window notification 클릭 잡는
            callback이 다수로 불려서 (정확한 원인을 찾지 못함)

            npm i lodash

            lodash 패키지 부른 후 click이벤트 콜백을 한번만 수행하게끔 코드 수정함.

            notifier.on('click',_.debounce((notifierObj,options,event)=>{  // Debounce(_.debounce)
                console.log(chalk.bgYellowBright('UnRead Mail Clicked '));
               
                    읽지 않음 메일의 notification 이 클릭 될때 
                    check_mailInfo 함수를 호출한다.
                    인자로는 notification의 message(readList[i])를 넘겨준다.
                
               
                check_mailInfo(options.message,browser);
            }));

            notifier.on('timeout', function (notifierObject, options) {
            // Triggers if `wait: true` and notification closes
              
            });
            */
        }     
        // forwarding한 메일 처리 
        if(unReadList[i] == '전달됨 '){
            /*
            notifier.notify(
            {
                title: 'Sending Alarm ',
                message: `${readList[i]}`,
                icon: path.join(__dirname, 'coulson.jpg'), // Absolute path (doesn't work on balloons)
                sound: true, // Only Notification Center or Windows Toasters
                wait: true // Wait with callback, until user action is taken against notification, does not apply to Windows Toasters as they always wait or notify-send as it does not support the wait option
            },
            function (err, response) {
            // Response is response from notification
            });
            notifier.on('click',(notifierObj,options,event)=>{

                console.log(chalk.cyanBright('<><><><>e<><><><><><><><><>    Sending Mail Clicked    <><><><><><><><><><><><><>'));
                //console.log(notifierObj); // Return : window.toaster object 
                console.log(options); // Return : notifier.notify 의 설정값
                console.log(event); // Return: empty Object  
            })
            */
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
            await mailPage.type('#rcmloginuser',_id,{delay:20});
            await mailPage.type('#rcmloginpwd',_pw,{delay:20});
            await mailPage.$(`#rcmloginsubmit`).then((result)=>{
                result.click();
            });
            await mailPage.waitForSelector("#rcmbtn107");
           
        }
        console.log(chalk.greenBright(figlet.textSync(`** Load Mail List **`,{ width : 110} )));
        
        await mailPage.waitForTimeout(1500);
        //let format = Date_formatting(); 
        /*
        while(true){
            console.log(`[Polling Count : ${cnt++}  `)

            await mailMonitoring(mailPage,browser);
            await mailPage.waitForTimeout(MAIL_POLLINGTIME);
            await mailPage.reload({ waitUntil: ["networkidle0"] });
        }
        */
        await mailMonitoring(mailPage,browser);
        await mailPage.waitForTimeout(dev_MAIL_POLLINGTIME);
        //await mailPage.reload({ waitUntil: ["networkidle0"] });
        await mailPage.close();    
    }   
}
/**
 * 
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



