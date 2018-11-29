import React, {
    Component
} from 'react';
import './App.css';

const supportedAudioFeatures = [
    "acousticness", "danceability", "energy", "instrumentalness",
    "liveness", "speechiness", "valence",
];

// For Reference:
// const unsupportedAudioFeatures = [
//     "loudness", "mode", "tempo", "time_signature"
// ]

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

class FeatureSlider extends Component {
    render(){
        const fName = this.props.featureName;

        return (
            <div>
                <input 
                    type="range"
                    name={fName+"-"+this.props.type}
                    min={this.props.min ? this.props.min : 0} 
                    max={this.props.max ? this.props.max : 1}
                    step="0.05" 
                    onChange={this.props.handleChange}
                    onInput={this.props.handleInput}
                    value={this.props.value}
                />
                <span>   {this.props.type}: {this.props.value} --  {fName}</span>
            </div>
        )
    }
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
    constructor(props) {
        super(props);

        this.state = {
            recommendations: [],
            featureValues: supportedAudioFeatures.reduce((o, key) => ({
                ...o, [key]: {weight:0, value:0.5}
            }), {})
        };
        this.handleChangeFeatureSlider = this.handleChangeFeatureSlider.bind(this);
        this.handleInputFeatureSlider = this.handleInputFeatureSlider.bind(this);
    }

    scoreRec(rec, featureValues){
        /* 
         * Implemented as euclidean distance from slider state 
         * TODO: This need to check the similarity not to the slider, but to the slider
         *       multiplied by either the average value for the field or the
         *       medium value that it can take
         * TODO: implement feature weights.
         * */
        console.log(featureValues);
        const squaredScore = supportedAudioFeatures
            .map(f => (10**(10*featureValues[f]['weight']) * (featureValues[f]['value'] - rec[f])**2))
            .reduce((a,b) => a + b, 0);

        const score = Math.sqrt(squaredScore);

        return score
    }

    scoreRecommendations(recs, featureValues){
        return recs.map(([trackI, audioF]) => [trackI, audioF, this.scoreRec(audioF, featureValues)]);
    }

    componentDidMount() {
        this.callApi()
            .then(res => {
                const recommendations = this.scoreRecommendations(res.recommendations, this.state.featureValues)
                this.setState({
                    recommendations: recommendations,
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

    handleChangeFeatureSlider(event){
        const name = event.target.name;
        const [featureName, sliderType] = name.split("-");

        const value = parseFloat(event.target.value);

        let featureValues = {...this.state.featureValues};
        featureValues[featureName][sliderType] = value;

        this.setState({featureValues: featureValues});
    }

    handleInputFeatureSlider(event){
        const recommendations = this.scoreRecommendations(this.state.recommendations, this.state.featureValues)
            .sort((t1, t2) => t1[2] - t2[2]);

        this.setState({
            recommendations: recommendations 
        })
    }

    render() {
        const tracks = this.state.recommendations
            .map((track) => (
                <li key={track[0].id} className="track-card-container">
                    <TrackCard trackInfo={track} />
                </li>
            ));

        const sliders = supportedAudioFeatures
            .map(fName => (
                <div className="feature-sliders-container" key={fName}>
                    <FeatureSlider 
                        featureName={fName} 
                        handleInput={this.handleInputFeatureSlider}
                        handleChange={this.handleChangeFeatureSlider}
                        value={this.state.featureValues[fName]['weight']}
                        min={-1}
                        max={1}
                        type="weight"
                    />
                    <FeatureSlider 
                        featureName={fName} 
                        handleInput={this.handleInputFeatureSlider}
                        handleChange={this.handleChangeFeatureSlider}
                        value={this.state.featureValues[fName]["value"]}
                        type="value"
                    />
                </div>
            ));

        return (
            <div className="App">
                <h1>Audio Features Explorer</h1>
                <p><strong>Weights</strong> allow you to adjust the importance of a audio feature.</p>
                <p><strong>Values</strong> allow you to adjust the ideal audio feature value.</p>
                <div className="audio-feature-sliders">
                    {sliders}
                </div>
                <ul>
                    {tracks}
                </ul>
            </div>
        );
    }
}
export default App;
