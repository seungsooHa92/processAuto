const {accountInfo} = require('./credential_data');
const puppeteer = require('puppeteer');
const inquirer = require('inquirer');

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
    let title = `[QA_used] Work process Automation Issue ${timeStamp}`;

    // 1. focus title Area
    await registerPage.click('#titleId',(result)=>{console.log('titleId clicked')})
    await registerPage.type('#titleId',title,{delay:20});

    await registerPage.waitForTimeout('1000');
    
    // Module ComboBox (dropDown )
    
    /*
    #important
    handle_alert -> callback
    callback must be precedent!
    */

    await handle_alert(registerPage);
    
    /* 
    the reson Why handle navigation
    when change the issue module
    cause page navigation 
        -> using page.waitForNavigation(), await navigation
    
    (maybe same situation at SPA, this problem is out of consideration ..? )
    */ 

    const navigation3 = registerPage.waitForNavigation();
    await registerPage.select('#mainModuleCode','048');
    await navigation3;

    await registerPage.waitForTimeout('600');
      
    /*
    part of page.evaluate()
    using window scroll

    #TODO
    
    sleep function ...
    
    */
    await registerPage.evaluate(async()=>{
        /*
        
        keep in mind 
        when operate page.evaluate() 

        Main Js process(Node.js) run node env.

        but output? result shown in target browser not local terminal!
        
        */
        const _sleep = async()=>{
            return new Promise((resolve)=>{
                setTimeout(resolve,200);
            })
        }
     
        for(let y = 0 ; y < 15 ; y++){
          
            window.scrollTo(0,150*y);
            if(y == 5){
               
                let _iframe = document.querySelector('[id^="xfeDesignFrame_"]');
                _iframe.contentDocument.body.innerText = 'issue detail';

            }
            await _sleep();
            
        }
        window.scrollTo(600,2100);


    })
    
    inquirer
    .prompt([
        {
		    type: 'list',
		    name: 'go',
		    message: 'Do you want really Issue up ?',
		    choices: ['true', 'false'],
        },
    ])
    .then((answers) => {
        
        
        let _go = (answers.go === 'true');
        console.log(_go);
        if(_go){
           
            registerPage.$('#but_save').then((result)=>{
                result.click();
            })
            
        }
        else{

        }
    })


    


}
_issueRegister();
