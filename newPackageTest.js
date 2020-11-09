const got = require('got');

(async()=>{

    try{
        const response = await got('https://www.npmjs.com/package/got');
        console.log(response.body);

    }catch(error){
        console.log(error.response.body);
    }

})();