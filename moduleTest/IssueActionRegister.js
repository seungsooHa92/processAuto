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
    await issue_page.waitForTimeout('600');

    // after login

    let url = `https://ims.tmaxsoft.com/tody/ims/issue/issueView.do?issueId=${issueNum}&menuCode=issue_search`

    await issue_page.goto(url);

    
    await issue_page.$('#actionRegImg').then((result)=>{
        result.click();
    })

    await issue_page.evaluate(async(actionContent)=>{

        let _iframe = document.querySelector('[id^="xfeDesignFrame_"]');
        _iframe.contentDocument.body.innerText = actionContent;

    },actionContent);




}


runner(246790,'asdfkljasdlfjiouwer');