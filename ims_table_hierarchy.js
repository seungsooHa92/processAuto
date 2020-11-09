const fs = require('fs');
const puppeteer = require('puppeteer');
const {
createCustomNoti,
classifyMail,
first_execute,
after_execute
} = require('./common_function');

const main = async()=>{
    
    const browser = await puppeteer.launch({
        headless: false, 
        args: ['--window-size=1920,1080']
    });

    const page = await browser.newPage();
    await page.setViewport(
        {//set Page viewPort
        width: 1920,
        height: 926,
        deviceScaleFactor: 1,
        }    
    );
    first_execute(page,'244063');

    await page.waitForSelector('#STATICMENU');

    let lengthData = await page.evaluate(()=>{

        let rightContent = document.querySelector('body > div:nth-child(2) > table > tbody > tr > td:nth-child(2) > table > tbody > tr:nth-child(2)').childNodes

        let rightContent_children = rightContent[1].children;
        let arr = Array.from(rightContent_children)
        const heightObj = {
            data:[],    
            scrollHeight: document.body.scrollHeight
        }
        arr.forEach((ele)=>{
            if(ele.id != 'STATICMENU'){
                //console.log(ele); inBrowser
                //console.log(ele.offsetHeight); inBrowser
                heightObj.data.push(ele.offsetHeight);
            }
   
        })
        return Promise.resolve(heightObj);
        
    })

    _heights = await lengthData;
    console.log(_heights.data);
    console.log(_heights.scrollHeight);



}
main();









/*

    let superParent = document.querySelector('body > div:nth-child(2) > table > tbody > tr > td:nth-child(2) > table');

    let rightContent = document.querySelector('body > div:nth-child(2) > table > tbody > tr > td:nth-child(2) > table > tbody > tr:nth-child(2)').childNodes

    let rightContent_children = rightContent[1].children;
    let arr = Array.from(rightContent_children)
    var sum = 0;
    arr.forEach((ele)=>{
        if(ele.id != 'STATICMENU'){
            console.log(ele)
            sum += ele.offsetHeight;
            console.log(ele.offsetHeight) 
        }
   
    })
console.warn(sum)
    
*/
