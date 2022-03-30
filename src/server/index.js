require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const fetch = require('node-fetch')
const path = require('path')

const app = express()
const port = 3000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/', express.static(path.join(__dirname, '../public')))

// your API calls

// example API call
app.get('/apod', async (req, res) => {
    try {
        let image = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}`)
            .then(res => res.json())
        res.send({ image })
    } catch (err) {
        console.log('error:', err);
    }
})

// get rover photos
app.get('/:roverName/photo', async (req, res) => {
    let roverName = req.params.roverName.toLowerCase();
    try {
        let images = await fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/${roverName}/latest_photos?&api_key=${process.env.API_KEY}`)
            .then(res => res.json())
            .then(res => res['latest_photos'].slice(-5))
        {res.send( { images } )
    }

        // if (roverName == 'curiosity') {res.send({curiosity :images});}
        // else if (roverName == 'opportunity') {res.send({opportunity :images});}
        // else if (roverName == 'spirit') {res.send({spirit :images});}

    } catch (err) {
        console.log('error:', err);
    }
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))