const got = require('got');

/* got Package Test
(async()=>{

    try{
        const response = await got('https://www.npmjs.com/package/got');
        console.log(response.body);

    }catch(error){
        console.log(error.response.body);
    }

})();
*/
const program = require('commander');
const inquirer = require('inquirer');
const chalk = require('chalk');

const main = async()=>{


	inquirer.prompt([{
		type: 'list',
		name: 'menu',
		message: 'CLI에 오신것을 환영합니다. 메뉴를 선택하세요.',
		choices: ['공부 하기', '퀴즈 풀기'],
	}])
	.then((answers) => {
		console.log(chalk.green(answers.menu) + "를 선택하셨습니다.");
		selected(answers.menu);
     })
    console.log('asdfjlaskdfj')
}

main()
