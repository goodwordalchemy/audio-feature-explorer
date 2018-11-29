'use strict';
const fs  = require('fs');

const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const port = process.env.PORT || 5000;
const sampleRecommendationsFile = 'tracks-with-features.json'

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

const getSampleRecommendations = () => {
	let sampleRecommendations = fs.readFileSync(sampleRecommendationsFile);
	sampleRecommendations = JSON.parse(sampleRecommendations);
	
	return sampleRecommendations
}

app.get('/api/recommendations', (req, res) => {
    res.send({
        recommendations: getSampleRecommendations()
    });
});
app.post('/api/world', (req, res) => {
    console.log(req.body);
    res.send(
        `I received your POST request. This is what you sent me: ${req.body.post}`,
    );
});

app.listen(port, () => console.log(`Listening on port ${port}`));
