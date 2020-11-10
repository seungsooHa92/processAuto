const fs = require('fs');
const puppeteer = require('puppeteer');
const {
createCustomNoti,
classifyMail,
first_execute,
after_execute
} = require('./common_function');
const chalk = require('chalk');
const path = require('path');
const { cpuUsage } = require('process');
const { action } = require('commander');

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
    console.log('[heights data]',_heights.data);
    console.log('[page scroll height]',_heights.scrollHeight);

    let sum = 0;
    _heights.data.forEach((h)=>{
        sum+=h;
    })

    console.log('[Sum of _heights.data]',sum);

    
    let initial_value = _heights.scrollHeight - sum;

    await page.evaluate(`window.scrollTo(0,${initial_value})`)
    
    let DOMRectX = 212;
    let DOMRectY = 69;

    let index = 0;

    //page Scroll 하는 부분 
    while(initial_value < _heights.scrollHeight){
        
        await page.evaluate(`window.scrollTo(${initial_value},${initial_value}+${_heights.data[index]})`);
        initial_value += 800;
    
        console.log(chalk.cyanBright(`[scrolling and height]: ${initial_value}`));
        await page.waitForTimeout(500);
        
        await page.screenshot({
            path:path.join(__dirname,`/res/testResult/scroll_${index}.png`),
            
        })
        
        await page.waitForTimeout(500);
        index++;
    }
}
main();

const commentDiv = async()=>{

    const browser = await puppeteer.launch({
        headless: false, 
        args: ['--start-fullscreen']
    });

    const page = await browser.newPage();
    await page.setViewport(
        {//set Page viewPort
        width: 1920,
        height: 1080,
        deviceScaleFactor: 1,
        }    
    );
    first_execute(page,'244063');

    await page.waitForSelector('#STATICMENU');

    let commentDivData = await page.evaluate(()=>{

        let comments = document.querySelector('#CommentsDiv'); // Action Div 를 반환한다.

        let comment_children = comments.children;
        let arr = Array.from(comment_children)
        const actionInfo ={
            getBound_:[],
            id_:[]
        }
        arr.forEach((ele)=>{
            console.log(ele)
            let customSizeObj = {
                //DOM
                x: ele.getBoundingClientRect().x,
                y: ele.getBoundingClientRect().y,
                width: ele.getBoundingClientRect().width,
                height: ele.getBoundingClientRect().height

            }
            actionInfo.getBound_.push(customSizeObj);
            actionInfo.id_.push(ele.id);
        })

        return Promise.resolve(actionInfo);  
    })
    actionDiv = await commentDivData;
    console.log('[actionDiv]', actionDiv.getBound_,actionDiv.id_);

    let initial_value = 0;
    for(let i = 0 ; i < actionDiv.getBound_.length ; i++){
        await page.evaluate(`window.scrollTo(${initial_value},${initial_value}+${actionDiv.getBound_[i].height})`);
        initial_value += actionDiv.getBound_[i].height;
        await page.screenshot({
            clip: actionDiv.getBound_[i],
            path:path.join(__dirname,`/res/testResult/scroll_${i}.png`),
        })
        await page.waitForTimeout(1000)
    }

}

//commentDiv()


