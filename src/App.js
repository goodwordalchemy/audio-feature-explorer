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
                
            </div>
        )
    }
}


class App extends Component {
    state = {
        recommendations: [],
    };

    componentDidMount() {
        this.callApi()
            .then(res => this.setState({
                recommendations: res.recommendations
            }))
            .catch(err => console.log(err));
    }

    callApi = async () => {
        const response = await fetch('/api/recommendations');
        const body = await response.json();
        if (response.status !== 200) throw Error(body.message);
        return body;
    };

    render() {
        const tracks = this.state.recommendations.map((track) =>{

            return (
                <li className="track-card-container"><TrackCard trackInfo={track} /></li>
            )
        });

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
