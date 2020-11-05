const chalk = require('chalk');
const figlet = require('figlet');
const commander = require('commander');

const start_prompt = ()=>{

    console.log(
        chalk.magentaBright(
            figlet.textSync('[  Work AutoMation  ]')
            )
        );

    commander
        .option('-h , --h <Bool>',' True/False')
        .option('-s, --s <*>','star parameter')
        .action(()=>{
            console.log(chalk.blueBright('*********************************************************'));
            console.log(chalk.blueBright(`[Headelss : ${commander.h}]  [star : ${commander.s}]`));
            console.log(chalk.blueBright('*********************************************************'));

    }).parse(process.argv);

}

module.exports={
    start_prompt,
}