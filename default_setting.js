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

const Date_formatting = ()=>{
    yymmdd = ()=>{
        let mm = this.getMonth() +1;
        let dd = this.getDate();

        return [this.getFullYear(), (mm>9 ? '':'0')+mm, (dd>9?'':'0')+dd].join('');

    }
    hhmmss = function() {
        var hh = this.getHours();
        var mm = this.getMinutes();
        var ss = this.getSeconds();

        return [(hh>9 ? '' : '0') + hh,
                (mm>9 ? '' : '0') + mm,
                (ss>9 ? '' : '0') + ss,
                            ].join('');
    };
    yyyymmddhhmmss = function() {
        return this.yyyymmdd() + this.hhmmss();
    };
}


module.exports={
    start_prompt,
    Date_formatting
}