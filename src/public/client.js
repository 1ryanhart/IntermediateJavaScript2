//------------------------------------------------------ SLIDESHOW

function showSlides(n) {
    let i;
    let slides = document.getElementsByClassName("mySlides");
    let thumbnails = document.getElementsByClassName("demo");
    for (i = 0; i < slides.length; i++) {
      slides[i].style.display = "none";
      thumbnails[i].className = thumbnails[i].className.replace(" active", "");
    }
    slides[n].style.display = "block";
    thumbnails[n].className += " active";
}

let store = {
    apod: '',
    rovers: ['Curiosity', 'Opportunity', 'Spirit'],
    selection: 'home',
    roverImages: ''
}

// add our markup to the page
const root = document.getElementById('root')

const updateStore = (store, newState) => {
    store = Object.assign(store, newState)
    render(root, store)
}

const render = async (root, state) => {
    root.innerHTML = App(state)
}


// create content. A HOF
const App = (state) => {
    let {selection, rovers, apod, roverImages } = state

    if (selection =='home') {return generateHomeContent(state, apod, rovers)}
    else {return generateRoverContent(state, selection, rovers, roverImages)}
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, store)
})

const generateHomeContent = (store, apod, rovers) => {
    return (`
        <header>
            ${header(store, rovers)}
        </header>
        <main>
            <section>
                <h3>Put things on the page!</h3>
                <p>Here is an example section.</p>
                <p>
                    One of the most popular websites at NASA is the Astronomy Picture of the Day. In fact, this website is one of
                    the most popular websites across all federal agencies. It has the popular appeal of a Justin Bieber video.
                    This endpoint structures the APOD imagery and associated metadata so that it can be repurposed for other
                    applications. In addition, if the concept_tags parameter is set to True, then keywords derived from the image
                    explanation are returned. These keywords could be used as auto-generated hashtags for twitter or instagram feeds;
                    but generally help with discoverability of relevant imagery.
                </p>
                ${ImageOfTheDay(apod)}
            </section>
        </main>
        <footer>${footer()}</footer>
    `)
}

const generateRoverContent = (store, selection, rovers, roverImages) => {
    return (`
        <header>
            ${header(store, rovers)}
        </header>
        <main>
            <h3>${selection}</h3>
            <section class="rover_section">
                ${displayRoverData(selection, roverImages)}
            </section>
        </main>
        <footer>${footer()}</footer>
    `)
}

// ------------------------------------------------------  COMPONENTS

const menuSelect = (rover, state) => {
    let selection = rover
    updateStore(store, {selection})
}

const header = (state, rovers) => {
    let { selection } = state;
    let listItems = rovers.map(rover => {
        let selectedClass = (selection===rover.toLowerCase() ? 'active' : '')
        return `
            <li onclick="menuSelect(this.innerHTML.toLowerCase(), store)" class="tab ${selectedClass}">${rover}</li>
        `
    }).join('')
    let selectedClass = (selection==='home' ? 'active' : '')
    return `
            <li class="nav_home ${selectedClass}" onclick="menuSelect(this.innerHTML.toLowerCase(), store)">Home</li>
            <nav>
                <ul class="nav_links">${listItems}</ul>
            </nav>`
}

const footer = () => {
    return (`
    <p>All data from <a href="https://api.nasa.gov/">NASA API</a></p>
    `)
}

const ImageOfTheDay = (apod) => {

    const today = new Date()
    const todayFormatted = today.toISOString().split('T')[0].toString()

    // If image does not already exist, or it is not from today -- request it again
    if (!apod || apod.image.date !== todayFormatted ) {
        getImageOfTheDay(store)    
    }

    // check if the photo of the day is actually type video!
    if (store.apod.media_type === "video") {
        return (`
            <p>See today's featured video <a href="${store.apod.image.url}">here</a></p>
            <p>${store.apod.image.title}</p>
            <p>${store.apod.image.explanation}</p>
        `)
    } else {
        return (`
            <img src="${store.apod.image.url}" height="350px" width="100%" />
            <p>${store.apod.image.explanation}</p>
        `)
    }
}

const displayRoverData = (selection, roverImages) => {
    if (roverImages == '' || roverImages.images[0].rover.name.toLowerCase() != selection) {
        getRoverImages(store)
    }

    //loop through all the photos in the roverImages to to create each photo block
    //the first image in the array is set to display:block
    let photoItems = roverImages['images'].map((image,index,array) => {
        return `
        <div class="mySlides" ${(index==0) ? 'style="display:block"' : ''}>
            <div class="numbertext">${index+1} / ${array.length}</div>
            <img src=${image.img_src} style="width:100%">
        </div>`
    }).join('')

    let thumbnailItems = roverImages['images'].map((image,index,array) => {
        return `
        <div class="column">
        <img class="demo cursor ${(index==0) ? 'active' : ''}" src=${image.img_src} style="width:100%" onclick="showSlides(${index})" alt="Rover photo">
        </div>`
    }).join('')

    return (`
        <div class="tile">
            <p>Photo slideshow</p>
            <div class="container">
                ${photoItems}
                <div class="row">
                    ${thumbnailItems}
                </div>
            </div>
        </div>
        <div class="tile">
            <p>Rover data</p>
            ${getRoverInfo(store.roverImages)}
        </div>
        `)
}

const getRoverInfo = (roverImages) => {
    let launchDate = roverImages.images[0].rover.launch_date
    let landingDate = roverImages.images[0].rover.landing_date
    let status = roverImages.images[0].rover.status
    let lastPhotoDate = roverImages.images[0].earth_date

    return (`
    <ul>
        <li>Launch Date: ${launchDate}</li>
        <li>Landing Date: ${landingDate}</li>
        <li>Status: ${status}</li>
        <li>lastPhotoDate: ${lastPhotoDate}</li>        
    </ul>
    `)
}
// ------------------------------------------------------  API CALLS

// Example API call
const getImageOfTheDay = (state) => {
    // let { apod } = state

    fetch(`http://localhost:3000/apod`)
        .then(res => res.json())
        .then(apod => updateStore(store, { apod }))

    // return data
}

const getRoverImages = (state) => {
    let { selection, roverImages } = state
    console.log(selection)
    fetch(`http://localhost:3000/${selection}/photo`)
        .then(res => res.json())
        .then(roverImages => updateStore(store, { roverImages }))
}


