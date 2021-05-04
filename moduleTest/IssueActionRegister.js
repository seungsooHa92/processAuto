const {accountInfo} = require('../credential_data');
const puppeteer = require('puppeteer');
const inquirer = require('inquirer');
const {_explicit_wait}= require('../common_function')

const handle_alert = async(page)=>{

    page.on('dialog',async (dialog) => {
        await dialog.accept();
    }); 
}
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

    await issue_page.keyboard.type(accountInfo._pw);

    const navigation1 = issue_page.waitForNavigation();
    
    await issue_page.evaluate(()=>{
        document.querySelector(`body > form > table > tbody > tr > td > table > tbody > tr:nth-child(2) > td:nth-child(1) > table > tbody > tr > td:nth-child(2) > table > tbody > tr > td:nth-child(2) > table > tbody > tr > td:nth-child(3) > input[type=image]`)
        .click();
    });

    await navigation1;
    // after login
    const navigation2 = issue_page.waitForNavigation();
    await issue_page.type('#topIssueId',issueNum,{delay:20});
    //await page.type(String.fromCharCode(13));
    await issue_page.keyboard.press('Enter');
    await navigation2;
    //const navigation3 = issue_page.waitForNavigation();
    await issue_page.$('#actionRegImg').then((result)=>{
        result.click();
    });

    //await navigation3; navigation 처리 해봤자 navigation이 일어나지 않기때문에 code가 block 됨
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
    
    //second way 도 
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
    // timeout이 필요하네...?
    /*
    iframe Rendering is => async
    catch by userdefined CallBack
    */
    /*
    await issue_page.waitForTimeout(1000);
    await issue_page.evaluate(async()=>{

        console.log('Browser Enter ');
        console.log(document.getElementsByClassName('xfeDesignFrame'));
        
        
        console.log('Browser Exit');
    })
    */
    // timeout 무조건 필요하네 ,,,,
    
    /*
    await issue_page.waitForTimeout(1000);
    await issue_page.$('.xfeDesignFrame')
        .then((result)=>{
            console.log(result)
        })
    */
    // Last Solution
    /*
        simple way -> use `page.waitForTimeout`
        or
        using user defined -> _explicit_wait
    */
    await handle_alert(issue_page);

    let iframe_ = await _explicit_wait(issue_page,'.xfeDesignFrame',5,500);
    //console.log(iframe_);



    // when find a iframe 객체 
    if(iframe_){

        await issue_page.evaluate(async(actionContent)=>{

            console.log('Browser Enter ');
            let actionIframe = document.getElementsByClassName('xfeDesignFrame');
            console.log('Browser Exit');
            actionIframe[0].contentDocument.body.innerText = actionContent;

        },actionContent)
    }

    

    let saveButton_ = `#actionTable > tbody > tr > td > table > tbody > tr:nth-child(18) > td > img`;

    await issue_page.$(saveButton_).then((result)=>{
        result.click();
    })
    // alert 

}

// issue 번호 , action 내용 
inquirer
    .prompt([
        {
		    type: 'input',
		    name: 'issueNum',
		    message: 'What is Issue Number that you want register new Action ?',
		    
        },
        {
            type: 'input',
		    name: 'actionContent',
		    message: 'write your new action Content',
		    
        }
    ])
    .then((answers) => {
	    
        runner(answers.issueNum,answers.actionContent);
    })
