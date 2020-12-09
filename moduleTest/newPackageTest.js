const got = require('got');


(async()=>{

    try{
        const response = await got('https://miro.medium.com/max/600/1*LwGhp5Ln7GT8_rAvBqU1YQ.png');
		console.log(response.body);
		

    }catch(error){
        console.log(error.response.body);
    }

})();

//https://flaviocopes.com/node-download-image/
//https://medium.com/harrythegreat/node-js%EC%97%90%EC%84%9C-request-js-%EC%82%AC%EC%9A%A9%ED%95%98%EA%B8%B0-28744c52f68d
