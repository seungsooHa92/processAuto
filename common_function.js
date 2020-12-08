const nn = require('node-notifier');
const WindowsToaster = require('node-notifier/notifiers/toaster');
const chalk = require('chalk');
const got = require('got');
const fs = require('fs');
const puppeteer = require('puppeteer');
const {accountInfo} = require('./credential_data');
const commander = require('commander');
const common_dataset = require('./common_dataset');

/**
 * 
 *  ----------------------------------------------------------------------------------------------------------------------
 * 
 *  @function read_UnreadMail
 *
 *  @param page : mailPage that creat in MainRunner
 *  @param id :
 *  @description
 *  <pre>
 * 
 * 
 *  </pre>
 *  
 *  -----------------------------------------------------------------------------------------------------------------------
 */

const read_UnreadMail = async(page,id)=>{

    page_ = page;

    await page_.bringToFront();

    console.log('[Enter] read_UnreadMail Function ___________________________//');
    console.log('[Check] Right Parameter is Entered ? ');
    console.log(id);
    console.log(`${page}`);
    // first select Selector
    await page_.waitForTimeout(500);
    /*
    click 까진 되는데 dblClick은 동작 안함
    await page.click(`#${id} > td.subject > a > span`,{clickCount:2}).then((result)=>{
        console.log(result);
    })
    */
    /*
    TODO
    -> When excute `page.evaluate` which has a Parameter

        ** page.evaluate((parameter1)=>{},parameter1)
    
    */
    let getPos = await page_.evaluate( async(id)=> {

        const _sleep = async()=>{
            return new Promise((resolve)=>{
                setTimeout(resolve,200);
            })
        }

        await _sleep(); // 200ms 기다려바 시발

        console.log(`parameter Check : ${id}`);
        let mail_ = document.getElementById(`${id}`);

        console.warn('***',mail_);
        
        let mailPos = mail_.getBoundingClientRect();

        let mailPosObj = {

            x: mailPos.x,
            y: mailPos.y,
            width : mailPos.width,
            height: mailPos.height
        }

        return Promise.resolve(mailPosObj);
    
    }, id);

    let mail_tr_pos = await getPos;
    
    await page_.mouse.move(
        // mouse move to (center of <tr>)
        mail_tr_pos.x + mail_tr_pos.width/2,
        mail_tr_pos.y + mail_tr_pos.height/2 
        );
    await page_.waitForTimeout(50);

    /*
    Double Click 한느 부분
    */
    await page_.mouse.down({button:'left'});
    await page_.waitForTimeout(50);
    await page_.mouse.up({button:'left'});

    await page_.mouse.down({button:'left'});
    await page_.waitForTimeout(50);
    await page_.mouse.up({button:'left'});
 
    await page_.waitForTimeout(500);

    // 2020.12.08 안읽은 메일 더블클릭해서 세부 메일 탭 생성까지 현재 상황
    /*
    TODO
    */

    // back Button Click page back to main mailList url

    let navigation_back = page_.waitForNavigation();
    await page_.$('#rcmbtn107').then((result)=>{
        result.click();
    })
    await navigation_back;

}
/**
 * 
 *  ----------------------------------------------------------------------------------------------------------------------
 * 
 *  @function jsonFileWrite
 *
 *  @param rawdata : page_scrapper() -> return value [Object]
 *  @param data : JSON.strinfigy (fs.writeFile)

 *  @description
 *  <pre>
 *      page_scrapper() 에서 가져온
 *     _getIssuedData 데이터 값을 res/data 에 ims_${imsNumber}.json
 *      파일을 생성한다.
 *  </pre>
 *  
 *  -----------------------------------------------------------------------------------------------------------------------
 */

const jsonFileWrite = (rawdata,data)=>{
    return new Promise((resolve,reject)=>{
        fs.writeFile(`./res/data/ims_${rawdata.issueBasicInfo.IssueNumber}.json`,data,(err)=>{
            if(err) reject (err);
            else resolve(data);
        });

    })

}

/**
 *  ----------------------------------------------------------------------------------------------------------------------
 * 
 *  @function save_pngFile
 *
 *  @param  item : image array [img src URL]
 *  @param  ele_id : comment_div 의 id
 *  @param  issueNum : Issue Number
 *  @param  index: loop count
 *  @param  browser browser that created in mainRunner
 * 
 *  <pre>
 *    i can keep my center
 * 
 *  </pre>
 *  -----------------------------------------------------------------------------------------------------------------------
 */
const save_pngFile = async(item,ele_id,issueNum,index,browser)=>{

    console.log(
        `[save_pngFile] `
    )
    const page = await browser.newPage();
    /* 
        page goto image file URL 

        item -> url
        ** await viewSrc.buffer()
    */ 
    let viewSrc = await page.goto(item);
    fs.writeFile(`./res/data/ims_${issueNum}_${ele_id}_${index}.PNG`,await viewSrc.buffer(),(err)=>{
            if(err) {
                return console.log(err);
            }
            console.log("The file was saved!");
    })
}
/**
 *  ----------------------------------------------------------------------------------------------------------------------
 * 
 *  @function imageFileWrite
 *  
 *  @param image_array : get IssueInfo Object IssueInfoObj.actions.img[]  
 *  @param ele_id : action's unique ID
 *  @param issueNum : get Issue #
 *  @param browser : pass browser
 * 
 *  @description
 *  <pre>
 *   
 *  </pre>
 *  -----------------------------------------------------------------------------------------------------------------------
 */
const imageFileWrite = async(image_array,ele_id,issueNum,browser)=>{

    console.log(
        `[imageFileWrite] `
    )
    image_array.forEach(async(item,index)=>{
        
        await save_pngFile(item,ele_id,issueNum,index,browser);
    })
}

/**
 * 
 *  ----------------------------------------------------------------------------------------------------------------------
 * 
 *  @function createCustomNoti
 *
 *  @param options: notification Alarm 을 만들때 사용하는 option 값을 위한 parameter 
 *  @param isClick: click 콜백을 사용할지 안할지 bool
 *  @param clickFn: click 콜백함수 정의 
 *  @param 

 *  @description
 *  <pre>
 *      i. Custom Notification Alarm을 생성한다. 
 *  </pre>
 *  
 *  -----------------------------------------------------------------------------------------------------------------------
 */

const createCustomNoti = (options,isClick,clickFn)=>{

    let noti = new WindowsToaster();
    noti.notify(options);
    if(isClick){
        /*
        event binding => noti.on(`click`)
        */     
        noti.on('click',clickFn);
    }
}

/**
 * 
 *  ----------------------------------------------------------------------------------------------------------------------
 * 
 *  @function first_execute
 *
 *  @param page:  Page 객체 -> 해당 함수에서는 imsPage 역할 
 *  @param imsNum: 이슈번호 
 *
 *  @description
 *  <pre>
 *      i. 첫 노티 클릭시 실행되는 함수 
 *      ii. ims Login Page -> go To #imsNum page
 *  </pre>
 *  
 *  -----------------------------------------------------------------------------------------------------------------------
 */

const first_execute = async(page,imsNum)=>{
  
    /*
    puppeteer에서 input태그 처리하는 방법 
    reference : https://github.com/puppeteer/puppeteer/issues/441
    */  
    await page.goto('https://ims.tmaxsoft.com/tody/auth/login.do');
    await page.type('#id',accountInfo._id,{delay:20});

    await page.waitForTimeout('600');
    await page.evaluate(()=>{
        document.querySelector(`body > form > table > tbody > tr > td > table > tbody > tr:nth-child(2) > td:nth-child(1) > table > tbody > tr > td:nth-child(2) > table > tbody > tr > td:nth-child(2) > table > tbody > tr > td:nth-child(2) > input[type=password]`)
        .select();
    })

    await page.keyboard.type(accountInfo.__pw);

    const navigation1 = page.waitForNavigation();
    
    await page.evaluate(()=>{
        document.querySelector(`body > form > table > tbody > tr > td > table > tbody > tr:nth-child(2) > td:nth-child(1) > table > tbody > tr > td:nth-child(2) > table > tbody > tr > td:nth-child(2) > table > tbody > tr > td:nth-child(3) > input[type=image]`)
        .click();
    })
    /*
    await page.waitForSelector('body > div:nth-child(2) > table > tbody > tr > td:nth-child(2) > table > tbody > tr:nth-child(2) > td > table:nth-child(1) > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(2) > table > tbody > tr > td > table > tbody > tr > td > table > tbody > tr > td.title6' , {
        timeout: 60000
    });
    */
    await navigation1;
    await page.waitForTimeout('600');

    await page.type('#topIssueId',imsNum,{delay:20});

    const navigation2 = page.waitForNavigation();
    //await page.type(String.fromCharCode(13));
    await page.keyboard.press('Enter');
    await navigation2;

    //await page.goto(`https://ims.tmaxsoft.com/tody/ims/issue/issueView.do?issueId=${imsNum}&menuCode=issue_list`);
    /*
    await page.waitForNavigation({
         waitUntil: 'networkidle0',
    });
    */

}
/**
 * 
 *  ----------------------------------------------------------------------------------------------------------------------
 * 
 *  @function after_execute
 *
 *  @param page:  Page 객체 -> 해당 함수에서는 imsPage 역할 
 *  @param imsNum: 이슈번호 
 *
 *  @description
 *  <pre>
 *      first_execute 함수에서 login 처리 해준 후 수행되기때문에 바로 특정 imsNum 페이지로 간다
 *  </pre>
 *  
 *  -----------------------------------------------------------------------------------------------------------------------
 */
const after_execute = async(page,imsNum)=>{

    await page.goto(`https://ims.tmaxsoft.com/tody/ims/issue/issueView.do?issueId=${imsNum}`);

}


/**
 * 
 *  ----------------------------------------------------------------------------------------------------------------------
 * 
 *  @function traverseIMSPage
 *
 *  @param  imsPage
 *  @param  imsTargetURL
 *  @param  browser : mainRunner > check_mailInfo > 초기 생성한 browser 
 *  @description
 *  <pre>
 *      i. Mail Notification Click
 *      ii. 확인해야할 IMS 메일이면 
 *      iii. 해당 이슈 페이지 정보를 얻기위해 puppeteer page 객체 생성후 (imsPage)
 *      iv.  해당 URL 로 접속 imsPage.goto(imsTargetURL)
 *              
 *      -> imsPage, imsTargetURL index.js > check_mailInfo 에서 생성함
 * 
 *  </pre>
 *  
 *  -----------------------------------------------------------------------------------------------------------------------
 */
const traverseIMSPage = async(imsPage,imsTargetURL,browser)=>{

    let _getIssueData = await page_scrapper(imsPage,imsTargetURL);

    console.log('IMS Info Data',_getIssueData);
    let data = JSON.stringify(_getIssueData);
    /* promisify await가 동작하지 않음 */
    // 1. promise then
    // 2. promisify(TODO)
    // 3. async await https://stackoverflow.com/questions/31978347/fs-writefile-in-a-promise-asynchronous-synchronous-stuff (TODO)
    
    console.log(chalk.blue(`[latest Action is]  :${_getIssueData.actions[0]._text}`));

    //1. return new Promise at common_function

    jsonFileWrite(_getIssueData,data).then((results)=>{
        console.log(`[1] json file Write`)
    });

    /*
    Action that cotains image files(PNG, gif)
    save as a separate file by imageFileWrite
    */
    _getIssueData.actions.forEach( async(ele)=>{
        if(ele._img.length > 0){
            await imageFileWrite(ele._img,ele._id,_getIssueData.issueBasicInfo.IssueNumber,browser);
        }
    });
    await got.post('http://192.168.17.36:5000/puppeteer_', {
        json: {
            _getIssueData
        },
        responseType: 'json'
    });

    
}
/**
 * 
 *  ----------------------------------------------------------------------------------------------------------------------
 *  @function page_scrapper
 *
 *  @param page:  Page 객체 -> 해당 함수에서는 imsPage 역할 
 *
 *  @description
 *  <pre>
 *      1. notification click
 *      2. Enter that Ims Page
 *      3. screenshot page with scrolling
 *  </pre>
 *  
 *  -----------------------------------------------------------------------------------------------------------------------
 */
const page_scrapper = async(page,url)=>{

    let get_issueInfoTable = await page.evaluate(()=>{

        let requireIssueInfoObj = new Object(); //action Info Object

        let actions_Info = [];
        let actionHsitoryInfo = [];
        let issueManageInfo = new Object();
        /*
        TODO 
        action contains PNG, gif files 
        innerText-> innerHTML changed
        
        */
        document.querySelectorAll('[id^="commDescTR_"]').forEach((action)=>{

            let actionObj = new Object();
            actionObj._id = action.id;
            actionObj._text = action.innerText;
            let image_array = [];

            // action 에 포함되어있는 gif, png 파일을 array 형태로 따로 저장
            Array.from(action.children).forEach((ele_)=>{
                if(ele_.firstChild.currentSrc){
                    image_array.push(ele_.firstChild.currentSrc);
                }
                actionObj._img = image_array;
            })            
            actions_Info.push(actionObj);
        })
        document.querySelectorAll('[id^="action_"]').forEach((action_info)=>{
            actionHsitoryInfo.push(action_info.innerText);
        })
        let trs_array = Array.from(document.querySelector(`#issueInfoTable > tbody > tr > td:nth-child(1) > table > tbody`).children);
        trs_array.forEach((tr)=>{
            /*
            javascript Property Convention 
            -> remove Blank, - 
            ex. `issue Number` cannot be a property 

            */
            let _property = tr.cells[0].innerText.replace(/\s+/g, '').toString();
            issueManageInfo[_property] = tr.cells[1].innerText
        })

        requireIssueInfoObj.actions = actions_Info;
        requireIssueInfoObj.actionHistory = actionHsitoryInfo;
        requireIssueInfoObj.issueBasicInfo = issueManageInfo;
        
        return Promise.resolve(requireIssueInfoObj)
    })
    getIssueData = await get_issueInfoTable;
    //console.log(getIssueData);
    return Promise.resolve(getIssueData)

}

/**
 * 
 *  ----------------------------------------------------------------------------------------------------------------------
 *  Not Used 
 *  @function handle_newIssue
 *
 *  @param imsPage
 *  @param 
 *
 *  @description
 * 
 *  <pre>
 *    case1. reporter === me
 *          -> already open <status: OPEN>
 * 
 *    case2  reporter !== me
 *          -> need to be opened <status: NEW>
 * 
 *  </pre>
 *  
 *  -----------------------------------------------------------------------------------------------------------------------
 */

const handle_newIssue = async(imsPage)=>{

    console.log('handle_newISsue')

    let _getIssueData = await page_scrapper(imsPage,imsTargetURL);

    console.log(_getIssueData);

    await imsPage.$(`#activityTD`).then((result)=>{
        result.click();
    })

    await imsPage.select('#opt','value');


}
/**
 *  Not used but later ..
 *  ----------------------------------------------------------------------------------------------------------------------
 * 
 *  @function classifyMail
 *
 *  @param content:  issue 내용을 담아올 content
 *  @param browser:  브라우저 객체 
 *
 *  @description
 *  <pre>
 *      메일 분류를 위한 함수 
 *  </pre>
 *  
 *  -----------------------------------------------------------------------------------------------------------------------
 */
const classifyMail = async(content,browser)=> {
    
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
    first_execute,
    after_execute,
    page_scrapper,
    jsonFileWrite,
    imageFileWrite,
    traverseIMSPage,
    handle_newIssue,
    read_UnreadMail
}