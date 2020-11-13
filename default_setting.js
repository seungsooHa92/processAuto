const chalk = require('chalk');
const figlet = require('figlet');
const inquirer = require('inquirer');

const start_prompt = ()=>{

    console.log(chalk.magentaBright(figlet.textSync('[  Work AutoMation  ]')));

    inquirer
    .prompt([
    /* Pass your questions in here */
    
    ])
    .then(answers => {
    // Use user feedback for... whatever!!
    
    })
    .catch(error => {
        if(error.isTtyError) {
        // Prompt couldn't be rendered in the current environment
    
        }
        else {
      // Something else when wrong
        }
  });

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