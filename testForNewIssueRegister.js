const {accountInfo} = require('./credential_data');
const puppeteer = require('puppeteer');

/*
for Time Setting
*/
let  yymmdd = (date)=>{
    let mm = date.getMonth() +1;
    let dd = date.getDate();
    return [date.getFullYear(), (mm>9 ? '':'0')+mm, (dd>9?'':'0')+dd].join('');
}
let hhmmss = function(date) {
    var hh = date.getHours();
    var mm = date.getMinutes();
    var ss = date.getSeconds();
    return [(hh>9 ? '' : '0') + hh,
            (mm>9 ? '' : '0') + mm,
            (ss>9 ? '' : '0') + ss,
                        ].join('');
};
let yymmddhhmmss = function(date) {
    return yymmdd(date) + hhmmss(date);
};

/**
 * 
 *  ----------------------------------------------------------------------------------------------------------------------
 * 
 *  @function handle_alert
 *
 *  @param page: _issueRegister 에서 받아온 page 객체 
 *  @description
 *  <pre>
 *      Before alert pop up appear
 *      handle alert accept operation 
 *  </pre>
 *  
 *  -----------------------------------------------------------------------------------------------------------------------
 */
const handle_alert = async(page)=>{

    page.on('dialog',async (dialog) => {
        await dialog.accept();
    }); 

}
const _issueRegister = async()=>{

    const browser = await puppeteer.launch({
        headless: false, 
    });
    const registerPage = await browser.newPage();
    await registerPage.goto('https://ims.tmaxsoft.com/tody/auth/login.do');
    await registerPage.type('#id',accountInfo._id,{delay:20});

    await registerPage.waitForTimeout('600');
    await registerPage.evaluate(()=>{
        document.querySelector(`body > form > table > tbody > tr > td > table > tbody > tr:nth-child(2) > td:nth-child(1) > table > tbody > tr > td:nth-child(2) > table > tbody > tr > td:nth-child(2) > table > tbody > tr > td:nth-child(2) > input[type=password]`)
        .select();
    })

    await registerPage.keyboard.type(accountInfo.__pw);

    const navigation1 = registerPage.waitForNavigation();
    
    await registerPage.evaluate(()=>{
        document.querySelector(`body > form > table > tbody > tr > td > table > tbody > tr:nth-child(2) > td:nth-child(1) > table > tbody > tr > td:nth-child(2) > table > tbody > tr > td:nth-child(2) > table > tbody > tr > td:nth-child(3) > input[type=image]`)
        .click();
    })

    await navigation1;
    await registerPage.waitForTimeout('600');

    // after login

    const navigation2 = registerPage.waitForNavigation();

    await registerPage.$('body > div:nth-child(2) > table > tbody > tr > td:nth-child(1) > table > tbody > tr > td > table > tbody > tr:nth-child(11) > td')
                    .then((result)=>{result.click();})

    await navigation2;
    await registerPage.waitForTimeout('600');

    
    let timeStamp = yymmddhhmmss(new Date());
    let title = `[QA_used] Work procee Automation Issue ${timeStamp}`;

    // 1. focus title Area
    await registerPage.click('#titleId',(result)=>{console.log('titleId clicked')})
    await registerPage.type('#titleId',title,{delay:20});

    await registerPage.waitForTimeout('1000');
    
    // Module ComboBox (dropDown )
    /*
    ** important
    handle_alert -> callback
    callback must be precedent!
    */
    await handle_alert(registerPage);

    const navigation3 = registerPage.waitForNavigation();
    await registerPage.select('#mainModuleCode','048');
    await navigation3;
    await registerPage.waitForTimeout('600');

    await registerPage.evaluate(async()=>{

        const _sleep = async()=>{
            return new Promise((resolve)=>{
                setTimeout((resolve)=>{return resolve},1000);
            })
        }
 
        for(let y = 0 ; y < 10 ; y++){
            window.scrollTo(0,150*y);
            await _sleep();
        }
        window.scrollTo(600,150*9);

    })
    
}
_issueRegister();
