import React, {
    Component
} from 'react';
import './App.css';

const supportedAudioFeatures = [
    "danceability", "energy", "key", "loudness", "mode", "speechiness",
    "acousticness", "instrumentalness", "liveness", "valence",
    "tempo", "time_signature"
];

const filterObjectKeys = function(obj, keysToKeep){
    const filtered = Object.keys(obj)
        .filter(key => keysToKeep.includes(key))
        .reduce((acc, key) => {
            return {
                ...acc, 
                [key]: obj[key]
            };
        }, {});

    return filtered
}

class TrackCard extends Component {

    render(){
        const trackInfo = this.props.trackInfo;
        const audioFeaturesString = JSON.stringify(
            filterObjectKeys(trackInfo[1], supportedAudioFeatures),
            null, 2);

        const relaventTrackInfo = {
            trackName: trackInfo[0]['name'],
            albumName: trackInfo[0]['album']['name'],
            artistNames: trackInfo[0]['artists'].map((a) => a['name']).join(", "),
        }

        return (
            <div className="track-card">
                <div>trackName: {relaventTrackInfo.trackName}</div>
                <div>albumName: {relaventTrackInfo.albumName}</div>
                <div>artistNames: {relaventTrackInfo.artistNames}</div>
                <div>audioFeatures: <pre><code>{audioFeaturesString}</code></pre></div>
                <div>trackScore: {trackInfo[2]}</div>
                
            </div>
        )
    }
}


class App extends Component {
    state = {
        recommendations: [],
        featureValues: supportedAudioFeatures.reduce((o, key) => ({
            ...o, [key]: 0.5
        }), {})
    };

    scoreRec(rec){
        /* Implemented as euclidean distance from slider state */
        const squaredScore = supportedAudioFeatures
            .map(f => (this.state.featureValues[f] - rec[f])**2)
            .reduce((a,b) => a + b, 0);

        const score = Math.sqrt(squaredScore);

        return score
    }

    scoreRecommendations(recs){
        return recs.map(([trackI, audioF]) => [trackI, audioF, this.scoreRec(audioF)]);
    }

    componentDidMount() {
        this.callApi()
            .then(res => {
                this.setState({
                    recommendations: this.scoreRecommendations(res.recommendations)
                })
            })
            .catch(err => console.log(err));
    }

    callApi = async () => {
        const response = await fetch('/api/recommendations');
        const body = await response.json();
        if (response.status !== 200) throw Error(body.message);
        return body;
    };

    render() {
        const tracks = this.state.recommendations
            .sort((t1, t2) => t2[2] - t1[2])
            .map((track) => (
                <li key={track[0].id} className="track-card-container"><TrackCard trackInfo={track} /></li>
            ));


        return (
            <div className="App">
                <ul>
                    {tracks}
                </ul>
            </div>
        );
    }
}
export default App;
