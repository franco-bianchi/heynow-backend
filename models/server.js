const express = require('express');
const cors = require('cors');
const corpusEn = require('../data/corpus-en.json');
const corpusEs = require('../data/corpus-es.json');
const { dockStart } = require('@nlpjs/basic');
const { dbConnection } = require('../database/config');
const { getWeather } = require('../utils');
const { Ner } = require('@nlpjs/ner');
const { currentWeatherIntents, specificWeatherIntents } = require('../utils/constants');

class Server {
    constructor() {
        this.app = express();
        this.port = process.env.PORT;

        this.usersPath = '/api/users';
        this.authPath = '/api/auth';
        this.nlpPath = '/api/nlp';

        this.trainNlp();
        this.trainNer();

        // Conectar a base de datos
        this.connectDb();

        // Middlewares
        this.middlewares();

        // Rutas de mi aplicación
        this.routes();
    }

    async connectDb() {
        await dbConnection();
    }

    middlewares() {
        // CORS
        this.app.use(cors());

        // Lectura y parseo del body
        this.app.use(express.json());

        // Directorio Público
        this.app.use(express.static('public'));
    }

    routes() {
        this.app.use(this.authPath, require('../routes/auth'));
        this.app.use(this.usersPath, require('../routes/users'));
        this.app.post(this.nlpPath, async (req, res) => {
            const { lat, long, utterance } = req.body;
            let answer = '';
            const result = await this.nlp.process(utterance);

            if (!result) return res.json({
                answer: 'Lo siento, no entiendo lo que quieres decir, recuerda que mi conocimiento depende de mi entrenamiento previo'
            })

            if (currentWeatherIntents.includes(result.intent)) {
                if(!lat || !long){
                    return res.json({
                        answer: 'Lo siento, no entiendo lo que quieres decir, recuerda que mi conocimiento depende de mi entrenamiento previo'
                    })
                }

                const payload = {lat, long};
                answer = await getWeather(result.locale, payload);
            } else if(specificWeatherIntents.includes(result.intent)) {
                const processed = await this.ner.process({ text: utterance });
                const { utteranceText = ''} = processed.entities[0];
                if(!utteranceText) {
                    answer = 'Lo siento, no entiendo lo que quieres decir, recuerda que mi conocimiento depende de mi entrenamiento previo'
                }else {
                    const payload = {
                        location: utteranceText
                    };
                    answer = await getWeather(result.locale, payload);
                }
            } else {
                answer = result.answers[0].answer;
            }

            res.json({
                answer
            })
        });
    }

    async trainNlp() {
        const dock = await dockStart({ use: ['Basic', 'LangEn'] });
        const nlp = dock.get('nlp');
        nlp.addCorpus(corpusEn);
        nlp.addCorpus(corpusEs);
        await nlp.train();
        this.nlp = nlp;
    }

    async trainNer() {
        const ner = new Ner();
        ner.addAfterLastCondition('en', 'in', 'in');
        ner.addAfterLastCondition('en', 'en', 'en');
        this.ner = ner;
    }

    listen() {
        this.app.listen(this.port, () => {
            console.log('Server running on port ', this.port);
        });
    }
}

module.exports = Server;
