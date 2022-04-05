//------------------------------------------------------ SLIDESHOW
function showSlides(n) {
    let slides = document.getElementsByClassName("mySlides");
    let thumbnails = document.getElementsByClassName("demo");
    for (let i = 0; i < slides.length; i++) {
      slides[i].style.display = "none";
      thumbnails[i].className = thumbnails[i].className.replace(" active", "");
    }
    slides[n].style.display = "block";
    thumbnails[n].className += " active";
}

let store = Immutable.Map({
    apod: '',
    rovers: Immutable.List(['Curiosity', 'Opportunity', 'Spirit']),
    selection: 'home',
    roverImages: ''
})

// add our markup to the page
const root = document.getElementById('root')

const updateStore = (state, newState) => {
    // store = Object.assign(store, newState)
    store = state.merge(newState)
    render(root, store)
}

const render = async (root, state) => {
    root.innerHTML = App(state)
}


// create content. A HOF returning a function
const App = (state) => {
    let {selection} = state.toJS()
    if (selection =='home') {return generatePageContent(generateHomeContent, state.toJS())}
    {return generatePageContent(generateRoverContent, state.toJS())}
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, store)
})

// generate page content. A HOF taking a function as a parameter
const generatePageContent = (contentSelectFunction, state) => {
    return (`
        <header>
            ${header(state)}
        </header>
        ${contentSelectFunction(state)}
        <footer>${footer()}</footer>
    `)
}

const generateHomeContent = (state) => {
    let {apod} = state
    return (`
        <main>
            <section class="home_section">
                <h3>Welcome to the Mars Rover Dashboard!</h3>
                </br><p>Astronomy Picture of the Day</p>
                ${ImageOfTheDay(state, apod)}
            </section>
        </main>
    `)
}

const generateRoverContent = (state) => {
    let {selection, roverImages} = state
    return (`
        <main>
            <h3>${selection}</h3>
            <section class="rover_section">
                ${displayRoverData(state, selection, roverImages)}
            </section>
        </main>
    `)
}

// ------------------------------------------------------  COMPONENTS

const menuSelect = (rover) => {
    let selection = rover
    updateStore(store, {selection})
}

const header = (state) => {
    let { selection, rovers } = state;
    let listItems = rovers.map(rover => {
        let selectedClass = (selection===rover.toLowerCase() ? 'active' : '')
        return `
            <li onclick="menuSelect(this.innerHTML.toLowerCase())" class="tab ${selectedClass}">${rover}</li>
        `
    }).join('')
    let selectedClass = (selection==='home' ? 'active' : '')
    return `
            <li class="nav_home ${selectedClass}" onclick="menuSelect(this.innerHTML.toLowerCase())">Home</li>
            <nav>
                <ul class="nav_links">${listItems}</ul>
            </nav>`
}

const footer = () => {
    return (`
    <p>All data from <a href="https://api.nasa.gov/">NASA API</a></p>
    `)
}

const ImageOfTheDay = (state, apod) => {

    const today = new Date()
    const todayFormatted = today.toISOString().split('T')[0].toString()

    // If image does not already exist, or it is not from today -- request it again
    if (!apod || apod.image.date !== todayFormatted ) {
        getImageOfTheDay(state)    
    }

    // check if the photo of the day is actually type video!
    if (state.apod.media_type === "video") {
        return (`
            <p>See today's featured video <a href="${state.apod.image.url}">here</a></p>
            <p>${state.apod.image.title}</p>
            <p>${state.apod.image.explanation}</p>
        `)
    } else {
        return (`
            <img src="${state.apod.image.url}" height="350px" width="100%" />
            <p>${state.apod.image.explanation}</p>
        `)
    }
}

const displayRoverData = (state, selection, roverImages) => {
    if (roverImages == '' || roverImages.images[0].rover.name.toLowerCase() != selection) {
        getRoverImages(state)
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
            ${getRoverInfo(state.roverImages)}
        </div>
        `)
}

const getRoverInfo = (roverImages) => {
    let launchDate = roverImages.images[0].rover.launch_date
    let landingDate = roverImages.images[0].rover.landing_date
    let status = roverImages.images[0].rover.status
    let lastPhotoDate = roverImages.images[0].earth_date

    return (`
    <ul> </br>
        <li><span class="rover_info">Launch Date:</span> ${launchDate}</li>
        <li><span class="rover_info">Landing Date:</span> ${landingDate}</li>
        <li><span class="rover_info">Status:</span> ${status}</li>
        <li><span class="rover_info">Date of last photo:</span> ${lastPhotoDate}</li>        
    </ul>
    `)
}
// ------------------------------------------------------  API CALLS

// Example API call
const getImageOfTheDay = (state) => {
    fetch(`http://localhost:3000/apod`)
        .then(res => res.json())
        .then(apod => updateStore(store, { apod }))
}

const getRoverImages = (state) => {
    let { selection } = state
    fetch(`http://localhost:3000/${selection}/photo`)
        .then(res => res.json())
        .then(roverImages => updateStore(store, { roverImages }))
}


