

'use strict';

const admin = require('firebase-admin');
const request = require('request-promise');  

const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();

class ChatBotSupportApi {

    /*

    curl -v -X POST \
    -H "Content-Type: application/json"  \
    -u 'frontiere21:password' \
    -d '{"question":"come ti chiami?","doctype":"normal","min_score":0.0}' \
'http://ec2-52-47-168-118.eu-west-3.compute.amazonaws.com/qnamaker/v2.0/knowledgebases/2f5d6f6e-fb26-4ba2-b705-91d24b96cf79/generateAnswer'

*/
    askToInternalQnaBot (kq_id, question) {

        let qnaServiceUrl = "http://ec2-52-47-168-118.eu-west-3.compute.amazonaws.com/qnamaker/v2.0/knowledgebases/"+kq_id+"/generateAnswer";
        
        console.log('qnaServiceUrl', qnaServiceUrl);

        return new Promise(function(resolve, reject) {

                return request({            
                    uri :  qnaServiceUrl,
                    headers: {
                        'Authorization': "Basic ZnJvbnRpZXJlMjE6cGFzc3dvcmQ=",
                        'Content-Type': 'application/json'
                    },
                    method: 'POST',
                    json: true,
                    body: {"question": question,"doctype":"normal","min_score":0.0},
                    //resolveWithFullResponse: true
                    }).then(response => {
                    if (response.statusCode >= 400) {
                        // throw new Error(`HTTP Error: ${response.statusCode}`);
                        return reject(`HTTP Error: ${response.statusCode}`);
                    }
            
                    // console.log('SUCCESS! Posted', event.data.ref);        
                    console.log('SUCCESS! response', JSON.stringify(response));
                    

                    var answer = null;
                    var response_options;

                    if (response.hits && response.hits.length>0) {
                        answer = entities.decode(response.hits[0].document.answer);
                        console.log('answer', answer);    
                
                        // var question = response.hits[0].questions[0].document.question;
                        // console.log('question', question);   

                        answer = answer + " Sei soddisfatto della risposta?. \n Se sei soddisfatto digita \\close per chiudere la chat di supporto oppure \\agent per parlare con un operatore.";
                        response_options = { "question" : "Sei soddisfatto della risposta?",
                        "answers":[{"close":"Si grazie, chiudi la chat di supporto."}, {"agent":"NO, voglio parlare con un operatore"}]};

                    }else {
                        answer = "Non ho trovato una risposta nella knowledge base. \n Vuoi parlare con un operatore oppure riformulare la tua domanda ? \n Digita \\agent per parlare con un operatore oppure formula un nuova domanda.";
            
                        response_options = { "question" : "Vuoi parlare con un operatore?",
                        "answers":[{"agent":"Si, voglio parlare con un operatore."}, {"noperation":"NO, riformulo la domanda"}]};

                    }
                        
            
                    let resp = {answer:answer, response_options:response_options};

                    return resolve(resp);

                });

        });

    }

    askToQnaBot (question, qnaServiceUrl, qnaKey) {
          
        console.log('qnaServiceUrl', qnaServiceUrl);
        console.log('qnaKey', qnaKey);
    
        
        // chatApi.sendGroupMessage(sender_id, "Bot", recipient_id, "Support Group", "Ciao sono il Bot, sto cercado una risposta alla tua domanda. Un attimo di pazienza...", app_id);
    
        return new Promise(function(resolve, reject) {

                return request({
                    //uri: "https://westus.api.cognitive.microsoft.com/qnamaker/v2.0/knowledgebases/f486b8ed-b587-413a-948e-e02c9a129d12/generateAnswer",
            
                    uri :  qnaServiceUrl,
                    headers: {
                        //'Ocp-Apim-Subscription-Key': '59c2511b9825415eb4254ab8a7d4b094',
                        'Ocp-Apim-Subscription-Key': qnaKey,
                        'Content-Type': 'application/json'
                    },
                    method: 'POST',
                    json: true,
                    body: {"question": question},
                    //resolveWithFullResponse: true
                    }).then(response => {
                    if (response.statusCode >= 400) {
                        // throw new Error(`HTTP Error: ${response.statusCode}`);
                        return reject(`HTTP Error: ${response.statusCode}`);
                    }
            
                    // console.log('SUCCESS! Posted', event.data.ref);        
                    console.log('SUCCESS! response', response);
            
                    var answer = entities.decode(response.answers[0].answer);
                    console.log('answer', answer);    
            
                    var question = response.answers[0].questions[0];
                    console.log('question', question);        
            
            
                    var response_options;
            
                    if (answer == "No good match found in the KB"){
                        answer = "Non ho trovato una risposta nella knowledge base. \n Vuoi parlare con un operatore oppure riformulare la tua domanda ? \n Digita \\agent per parlare con un operatore oppure formula un nuova domanda.";
            
                        response_options = { "question" : "Vuoi parlare con un operatore?",
                        "answers":[{"agent":"Si, voglio parlare con un operatore."}, {"noperation":"NO, riformulo la domanda"}]};
                    }else if (answer == "\\agent"){ //if \\agent dont append se sei siddisfatto...
            
                    }else {
                        answer = answer + " Sei soddisfatto della risposta?. \n Se sei soddisfatto digita \\close per chiudere la chat di supporto oppure \\agent per parlare con un operatore.";
                        response_options = { "question" : "Sei soddisfatto della risposta?",
                        "answers":[{"close":"Si grazie, chiudi la chat di supporto."}, {"agent":"NO, voglio parlare con un operatore"}]};
            
                    }
                    let resp = {answer:answer, response_options:response_options};

                    return resolve(resp);

                });

        });

    }
      
  
}


var chatBotSupportApi = new ChatBotSupportApi();


module.exports = chatBotSupportApi;