const nn = require('node-notifier');
const WindowsToaster = require('node-notifier/notifiers/toaster');
const chalk = require('chalk');
const _id = `seungsoo_ha`;
const _pw = `S1s1s1s1!`;
const __pw = `S1s1s1s1s1!`;
const got = require('got');
const fs = require('fs');
const puppeteer = require('puppeteer');


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
 *  @param  item : 각각의 image array 의 담긴 img src URL
 *  @param  ele_id : comment_div 의 id
 *  @param  issueNum : 이슈 번호
 *  @param  index: loop count
 *  @param  browser mainRunner에서 부터 전달 받은 browser 객체
 * 
 *  <pre>
 *   
 *  </pre>
 *  -----------------------------------------------------------------------------------------------------------------------
 */
const save_pngFile = async(item,ele_id,issueNum,index,browser)=>{

    console.log(
        `[save_pngFile] `
    )
    const page = await browser.newPage()
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
    await page.type('#id',_id,{delay:20});

    await page.waitForTimeout('600');
    await page.evaluate(()=>{
        document.querySelector(`body > form > table > tbody > tr > td > table > tbody > tr:nth-child(2) > td:nth-child(1) > table > tbody > tr > td:nth-child(2) > table > tbody > tr > td:nth-child(2) > table > tbody > tr > td:nth-child(2) > input[type=password]`)
        .select();
    })

    await page.keyboard.type(__pw);

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

    /*
    const getHeihgts_Data = await page.evaluate(()=>{

        let scrollHeight_ = document.body.scrollHeight;
        return Promise.resolve(scrollHeight_)

    })

    _heightsInfo = await getHeihgts_Data;
    console.log('***',_heightsInfo);
    await page.setViewport( 
        {//set Page viewPort
        width : 1920,               
        height : _heightsInfo+1000,               
    })
    
    await page.waitForTimeout('400');
    */
    /*
    try {
        const response = await got(url);
        console.log(response.body);
        const $ = cheerio.load(response.body);
        console.log($('<td class=tilte></td>').data())

    } catch (error) {
        console.log(error.response.body);
        //=> 'Internal server error ...'
    }
    */

    let get_issueInfoTable = await page.evaluate(()=>{

        let requireIssueInfoObj = new Object(); //action Info Object

        let actions_Info = [];
        let actionHsitoryInfo = [];
        let issueManageInfo = new Object();
        /*
        TODO 
        action contains PNG, gif files 
        innerText-> innerHTML changed
        아니 ㅣ씨ㅣㅣㅣㅣ발 innerHTML 성능이 안좋으면 뭐 어쩌라고 씨이이ㅏㄹ바ㅣㄼ
        */
        document.querySelectorAll('[id^="commDescTR_"]').forEach((action)=>{

            let actionObj = new Object();
            actionObj._id = action.id;
            actionObj._text = action.innerText;
            let image_array = [];
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
 *  @function checkMail
 *
 *  @param content:  issue 내용을 담아올 content
 *  @param browser:  브라우저 객체 
 *
 *  @description
 *  <pre>
 *      mail 함에서 새로운 메일 내용 확인후 mail 메인 화면으로 돌아오는 함수
 *  </pre>
 *  
 *  -----------------------------------------------------------------------------------------------------------------------
 */

const checkMail = async(browser)=>{

    const detailMailPage = await browser.newPage();
    await detailMailPage.setViewport({//set Page viewPort
                        width: 1920,
                        height: 1080,
                        deviceScaleFactor: 1,
        });

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
    first_execute,
    after_execute,
    page_scrapper,
    jsonFileWrite,
    imageFileWrite,
}