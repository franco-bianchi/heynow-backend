const express = require('express');
const cors = require('cors');
const corpusEn = require('../data/corpus-en.json');
const corpusEs = require('../data/corpus-es.json');
const { dockStart } = require('@nlpjs/basic');

const { dbConnection } = require('../database/config');
// const { default: axios } = require('axios');
const { getWeather } = require('../utils');

class Server {
    constructor() {
        this.app = express();
        this.port = process.env.PORT;

        this.usersPath = '/api/users';
        this.authPath = '/api/auth';
        this.nlpPath = '/api/nlp';

        this.train();

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

            if (result.intent === 'info.weather.current' || result.intent === 'info.clima.current') {
                if(!lat || !long){
                    return res.json({
                        answer: 'Lo siento, no entiendo lo que quieres decir, recuerda que mi conocimiento depende de mi entrenamiento previo'
                    })
                }
                answer = await getWeather(result.locale, lat, long);
            } else {
                answer = result.answers[0].answer;
            }

            res.json({
                answer
            })
        });
    }

    async train() {
        const dock = await dockStart({ use: ['Basic', 'LangEn'] });
        const nlp = dock.get('nlp');
        nlp.addCorpus(corpusEn);
        nlp.addCorpus(corpusEs);
        await nlp.train();
        this.nlp = nlp;
    }

    listen() {
        this.app.listen(this.port, () => {
            console.log('Server running on port ', this.port);
        });
    }
}

module.exports = Server;
