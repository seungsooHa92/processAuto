const {accountInfo} = require('../credential_data');
const puppeteer = require('puppeteer');
const inquirer = require('inquirer');


const runner = async(issueNum,actionContent)=>{

    const browser = await puppeteer.launch({
        headless: false,
    });
    const issue_page = await browser.newPage();

    await issue_page.goto('https://ims.tmaxsoft.com/tody/auth/login.do');
    await issue_page.type('#id',accountInfo._id,{delay:20});

    await issue_page.waitForTimeout('600');
    await issue_page.evaluate(()=>{
        document.querySelector(`body > form > table > tbody > tr > td > table > tbody > tr:nth-child(2) > td:nth-child(1) > table > tbody > tr > td:nth-child(2) > table > tbody > tr > td:nth-child(2) > table > tbody > tr > td:nth-child(2) > input[type=password]`)
        .select();
    })

    await issue_page.keyboard.type(accountInfo.__pw);

    const navigation1 = issue_page.waitForNavigation();
    
    await issue_page.evaluate(()=>{
        document.querySelector(`body > form > table > tbody > tr > td > table > tbody > tr:nth-child(2) > td:nth-child(1) > table > tbody > tr > td:nth-child(2) > table > tbody > tr > td:nth-child(2) > table > tbody > tr > td:nth-child(3) > input[type=image]`)
        .click();
    })

    await navigation1;

    // after login

    const navigation2 = issue_page.waitForNavigation();
    await issue_page.type('#topIssueId',issueNum,{delay:20});

    //await page.type(String.fromCharCode(13));
    await issue_page.keyboard.press('Enter');
    await navigation2;

    // 미친놈아 여기다 navi를 왜 거냐 미친새끼;
    //const navigation3 = issue_page.waitForNavigation();

    await issue_page.$('#actionRegImg').then((result)=>{
        result.click();
    })

    //await navigation3;
    //This is same way used at testForNewIssueRegister
    //but this didn't work


    /*
    await issue_page.evaluate(()=>{

        window.scrollTo(0,200);
        let _iframe = document.querySelector('[id^="xfeDesignFrame_"]');
        console.log('Check grab frame:',_iframe)
        _iframe.contentDocument.body.innerText = 'actionContentdfasdf';

    });
    */

    
    //second way 도 블락,,,, 시....발.....

    /*
    console.log('[Before page.evaluate]');
    let getIFrameId = await issue_page.evaluate(async()=>{
        let _iframe = document.querySelector('[id^="xfeDesignFrame_"]');
        console.log(_iframe);
        let id = _iframe.id;
        return Promise.resolve(id);
    })
    _iframeId = await getIFrameId;
    console.log(_iframeId);
    await issue_page.type(`#${_iframeId}`,'asdfasdfasdfasdf',{delay:20});
    
    */

    /*
    third way 너마저....ㅠ
    
    const frameHandle = await issue_page.$("iframe[id='xfeDesignFrame_']");
    console.log(frameHandle);
    const frame = await frameHandle.contentFrame();
    await frame.type('input','test')
    */
}


runner('246790','asdfkljasdlfjiouwer');