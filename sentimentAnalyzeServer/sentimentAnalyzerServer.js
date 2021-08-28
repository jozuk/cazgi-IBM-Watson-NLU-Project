const express = require('express');
const app = new express();
const dotenv = require('dotenv');
dotenv.config();

function getNLUInstance() {
    let apikey = process.env.API_KEY;
    let apiurl = process.env.API_URL;
    const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1');
    const { IamAuthenticator } = require('ibm-watson/auth');

    const naturalLanguageUnderstanding = new NaturalLanguageUnderstandingV1({
        version: '2021-03-25',
        authenticator: new IamAuthenticator({
            apikey: apikey,
        }),
        serviceUrl: apiurl,
    });

    return naturalLanguageUnderstanding;
}

function sentiment(text, type){
    const analyzeParams = {
        'features': {
          'sentiment': {
            'document' : true
          }
        }
    };
    if( type == 1){
        analyzeParams.url = text;
    }else{
        analyzeParams.text = text;
    }
    return analyzeParams;
}

function emotion(text, type){
    const analyzeParams = {
        'features': {
            'emotion': {
                'targets': [
                    "sadness",
                    "fear",
                    "joy",
                    "anger",
                    "disgust"
                ],
                'document' : true
            },
            'keywords': {
              'emotion': true
            }
        }
    };
    if( type == 1){
        analyzeParams.url = text;
    }else{
        analyzeParams.text = text;
    }
    return analyzeParams;    
}

app.use(express.static('client'));

const cors_app = require('cors');
app.use(cors_app());

app.get("/",(req,res)=>{
    res.render('index.html');
  });

app.get("/url/emotion", (req,res) => {
    console.log('text emotion for url ' + JSON.stringify(req.query.url));
    getNLUInstance().analyze(emotion(req.query.url, 1)).then(analysisResults => {
        console.log(JSON.stringify(analysisResults, null, 2).replace("\"",''));
        return res.send(JSON.stringify(analysisResults.result.keywords["0"].emotion));
    })
    .catch(err => {
        console.log('error:', err);
        return res.send('target not found');
    });
});

app.get("/url/sentiment", (req,res) => {
    console.log('text sentiment for url ' + req.query.url);    
    getNLUInstance().analyze(sentiment(req.query.url, 1)).then(analysisResults => {
        console.log(JSON.stringify(analysisResults, null, 2).replace("\"",''));
        return res.send(JSON.stringify(analysisResults.result.sentiment.document.label).replace("\"",'').replace("\"",''));
    })
    .catch(err => {
        console.log('error:', err);
        return res.send('target not found');
    });
});

app.get("/text/emotion", (req,res) => {
    console.log('text emotion for ' + req.query.text);
    getNLUInstance().analyze(emotion(req.query.text, 0)).then(analysisResults => {
        console.log(JSON.stringify(analysisResults, null, 2).replace("\"",''));
        return res.send(JSON.stringify(analysisResults.result.keywords["0"].emotion));
    })
    .catch(err => {
        console.log('error:', err);
        return res.send('target not found');
    });
});

app.get("/text/sentiment", (req,res) => {
    console.log('text sentiment for ' + req.query.text);    
    getNLUInstance().analyze(sentiment(req.query.text, 0)).then(analysisResults => {
        console.log(JSON.stringify(analysisResults, null, 2).replace("\"",''));
        return res.send(JSON.stringify(analysisResults.result.sentiment.document.label).replace("\"",'').replace("\"",''));
    })
    .catch(err => {
        console.log('error:', err);
        return res.send('target not found');
    });
});

let server = app.listen(8080, () => {
    console.log('Listening', server.address().port)
})
