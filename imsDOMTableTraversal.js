const puppeteer = require('puppeteer');

const _id = `seungsoo_ha`;
const _pw = `S1s1s1s1!`;
const __pw = `S1s1s1s1s1!`;


const mainRunner = async()=>{

    const browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    // Navigate to the demo page.


    await page.goto('https://ims.tmaxsoft.com/tody/auth/login.do');
    await page.type('#id',_id,{delay:20});


    await page.evaluate(()=>{
        document.querySelector(`body > form > table > tbody > tr > td > table > tbody > tr:nth-child(2) > td:nth-child(1) > table > tbody > tr > td:nth-child(2) > table > tbody > tr > td:nth-child(2) > table > tbody > tr > td:nth-child(2) > input[type=password]`)
        .select();
    })

    await page.keyboard.type(__pw);



    await page.evaluate(()=>{
        document.querySelector(`body > form > table > tbody > tr > td > table > tbody > tr:nth-child(2) > td:nth-child(1) > table > tbody > tr > td:nth-child(2) > table > tbody > tr > td:nth-child(2) > table > tbody > tr > td:nth-child(3) > input[type=image]`)
        .click();
    })

    await page.waitForSelector('body > div:nth-child(2) > table > tbody > tr > td:nth-child(2) > table > tbody > tr:nth-child(2) > td > table:nth-child(1) > tbody > tr:nth-child(2) > td > table > tbody > tr > td:nth-child(2) > table > tbody > tr > td > table > tbody > tr > td > table > tbody > tr > td.title6' , {
        timeout: 60000
    });
    
    console.log(page.url())
    
    await page.goto('https://ims.tmaxsoft.com/tody/ims/issue/issueView.do?issueId=244063&menuCode=issue_list');
    console.log(page.url())

    /* ok
    await page.$$('table').then((result)=>{
        console.log(result)
    })*/
    
    //await page.$$eval('table',list =>{console.log(list)})

    let allTable =[]
    console.log(1)
    await page.evaluate(()=>{
        //하승수 이 병신 page.evaluate 하면 무조건 browser 환경이다 이새꺄
        //https://stackoverflow.com/questions/57570538/how-do-i-return-a-value-from-page-evaluate-in-puppeteer
        console.log(document.querySelectorAll('table'));
        allTable = document.querySelectorAll('table')
        console.log(2)
    })

    console.log(allTable)
    console.log(3)
/*
    if(w.id.includes('Layout')){
		
			this.space += '\t'
			console.log(this.space+'[I am Layout]',w.id)
			w.getChildren().forEach((ele)=>{
				
				let n = Top.Dom.selectById(ele.id)
				this.findChild_recursive(n)
			})
			
		}
		else{
			
			console.log(this.space+'	    I am Child >>>>',w.id)
			return;
		}
		
*/
}
mainRunner();
