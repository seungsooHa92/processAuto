const {accountInfo} = require('./credential_data');
const puppeteer = require('puppeteer');

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

    
    await registerPage.select('#mainModuleCode','048');
    await registerPage.waitForTimeout(600);
    // handle alert TODO
    registerPage.on('dialog',dialog => {
        dialog.accept();
    });
    //await registerPage.click(`input[name='alert']`)​;

    /*
    await registerPage.evaluate(()=>{
        let init_y = 800;
        for(let y = 0 ; y < 4 ; y++){
            window.scrollTo(0,init_y+400*y);
        }
        window.scrollTo(600,2000);

    })
    */
}
_issueRegister();
