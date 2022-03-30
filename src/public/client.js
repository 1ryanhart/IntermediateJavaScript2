let slideIndex = 1;

//------------------------------------------------------ SLIDESHOW


// Next/previous controls
function plusSlides(n) {
    showSlides(slideIndex += n);
}

function currentSlide(n) {
    showSlides(slideIndex = n);
  }

function showSlides(n) {
    let i;
    let slides = document.getElementsByClassName("mySlides");
    let thumbnails = document.getElementsByClassName("demo");
    let captionText = document.getElementById("caption");
    if (n > slides.length) {slideIndex = 1}
    if (n < 1) {slideIndex = slides.length}
    for (i = 0; i < slides.length; i++) {
      slides[i].style.display = "none";
      thumbnails[i].className = thumbnails[i].className.replace(" active", "");
    }
    slides[slideIndex-1].style.display = "block";
    thumbnails[slideIndex-1].className += " active";
    captionText.innerHTML = thumbnails[slideIndex-1].alt;
}


let store = {
    user: { name: "Student" },
    apod: '',
    rovers: ['Curiosity', 'Opportunity', 'Spirit'],
    selection: 'home',
    roverImages: '',
    slideIndex: 1
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


// create content
const App = (state) => {
    let {selection, rovers, apod, roverImages } = state

    if (selection =='home') {
        return `
        <header>
            ${header(store, rovers)}
        </header>
        <main>
            ${Greeting(store.user.name)}
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
        <footer></footer>
    `
    }
    else {
        console.log(`inside the else block in App function. logging 'roverImages'${roverImages}`)
        return `
        <header>
            ${header(store, rovers)}
        </header>
        <main>
            <h3>${selection}</h3>
            <section class="rover_section">
                ${displayRoverData(selection, roverImages)}
            </section>
        </main>
        <footer></footer>
    `
    }
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, store)
})

// ------------------------------------------------------  COMPONENTS

// Pure function that renders conditional information -- THIS IS JUST AN EXAMPLE, you can delete it.
const Greeting = (name) => {
    if (name) {
        return `
            <h1>Welcome, ${name}!</h1>
        `
    }

    return `
        <h1>Hello!</h1>
    `
}

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

// Example of a pure function that renders infomation requested from the backend

const ImageOfTheDay = (apod) => {

    // If image does not already exist, or it is not from today -- request it again
    const today = new Date()
    const todayFormatted = today.toISOString().split('T')[0].toString()

    if (!apod || apod.image.date !== todayFormatted ) {
        getImageOfTheDay(store)    
    }

    // check if the photo of the day is actually type video!
    if (apod.media_type === "video") {
        return (`
            <p>See today's featured video <a href="${apod.image.url}">here</a></p>
            <p>${apod.image.title}</p>
            <p>${apod.image.explanation}</p>
        `)
    } else {
        return (`
            <img src="${apod.image.url}" height="350px" width="100%" />
            <p>${apod.image.explanation}</p>
        `)
    }
}

const displayRoverData = (selection, roverImages) => {
    if (roverImages == '') {
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
        <img class="demo cursor" src=${image.img_src} style="width:100%" onclick="currentSlide(${index+1})" alt="Rover photo">
        </div>`
    }).join('')

    return (`
        <div class="tile">
            <p>Photo slideshow</p>
            <div class="container">
                ${photoItems}
                <a class="prev" onclick="plusSlides(-1)">&#10094;</a>
                <a class="next" onclick="plusSlides(1)">&#10095;</a>
                <div class="caption-container">
                    <p id="caption">Caption</p>
                </div>
                    ${thumbnailItems}
                <div class="row">
                </div>
            </div>
        </div>
        <div class="tile">
            <p>Rover data</p>
            <ul>
                <li>list item</li>
            </ul>
        </div>

        `)
}

// ------------------------------------------------------  API CALLS

// Example API call
const getImageOfTheDay = (state) => {
    let { apod } = state

    fetch(`http://localhost:3000/apod`)
        .then(res => res.json())
        .then(apod => updateStore(store, { apod }))

    // return data
}

const getRoverImages = (state) => {
    let { selection, roverImages } = state

    fetch(`http://localhost:3000/${selection}/photo`)
        .then(res => res.json())
        .then(roverImages => updateStore(store, { roverImages }))
}


