let scoresObj = {};
let resultsObj = {};
let questionList = [];

//Util functions
async function getJSON(file) {
    const response = await fetch(file);
    const data = await response.json();
    return data;
}

async function getCSV(file) {
    const response = await fetch(file);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    const csvData = await response.text();
    const parsedData = Papa.parse(csvData, { skipEmptyLines: false });
    return parsedData.data;
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function applyEffects()
{
    var content = document.getElementById('Q&A');
    content.classList.toggle('blur-enlarge-fade');
}

function clearElemAnim(elementID)
{
    var content = document.getElementById('Q&A');
    content.classList.add('blur-enlarge-fade');
}

function clearElem(elementID)
{
    var content = document.getElementById('Q&A');
    content.classList.remove('blur-enlarge-fade');
    content.innerHTML = "";
}

function constructQANDA(questionJSON)
{
    clearElem("Q&A");

    const divQANDA = document.getElementById("Q&A")

    const questionLabel = document.createElement('questionLabel');
    questionLabel.textContent = questionJSON.text;

    divQANDA.appendChild(questionLabel);

    divQANDA.innerHTML += '<br>';

    const divA = document.createElement('div');
    divA.className = 'answerContainer';

    for (let i = 0; i < questionJSON.answers.length; i++)
    {
        var answerButton = document.createElement('button')
        answerButton.className = 'answerButton';
        answerButton.textContent = questionJSON.answers[i].text
        answerButton.addEventListener('click', function() {
            incrementScores(questionJSON.answers[i].personality, questionJSON.answers[i].points);
        });

        divA.appendChild(answerButton)
    }

    divQANDA.appendChild(divA);
    questionList.shift();
}

async function constructIntro()
{
    clearElem("Q&A");

    const divQANDA = document.getElementById("Q&A")

    const introText1 = document.createElement('body');
    introText1.className = "intro1";
    introText1.textContent = "The following is a quiz which will help you discover your favourite events at the Southside Festival!";
    divQANDA.appendChild(introText1);


    const introText2 = document.createElement('body');
    introText2.className = "intro2";
    introText2.textContent = "Are you ready?";
    divQANDA.appendChild(introText2);

    const readyButton = document.createElement('button')
    readyButton.className = "readyButton"
    readyButton.textContent = "I'm ready!"
    readyButton.addEventListener('click', function() {
        startQuestions();
        //sebDebug();
    });

    divQANDA.appendChild(readyButton)
}

async function constructResults()
{
    clearElem("Q&A");

    // load every personality and event
    let personalitiesObj = await getPersonalities();
    let eventsObj = await getEvents();

    // create array of the highest scoring personalities
    let likelyPersonalities = [];
    console.log(scoresObj);
    console.log(personalitiesObj);
    //      loop through every score to find high score
    let highscore = 0
    for (let personalityKey in scoresObj) {
        personalityScore = scoresObj[personalityKey];
        if(personalityScore > highscore){
            highscore = personalityScore;
        }
    }
    //      loop through every score and add every personality which has high score
    for (let personalityKey in scoresObj) {
        personalityScore = scoresObj[personalityKey];
        if(personalityScore == highscore){
            likelyPersonalities.push(personalityKey);
        }
    }

    // tiebreaker logic
    //      loop through every personality, first one to appear gets assigned and break out of loop
    let personality = "";
    for (let personalityKey in personalitiesObj) {
        if(likelyPersonalities.includes(personalityKey)){
            personality = personalityKey;
            break;
        }
    }
    console.log(highscore);
    console.log(likelyPersonalities);
    console.log(personality);


    const divQANDA = document.getElementById("Q&A")
    // construct and show personality summary
    const summaryDiv = document.createElement('div');
    summaryDiv.classList.add('results-div');
    
    const summaryText0 = document.createElement('span');
    summaryText0.textContent = "PERSONALITY";
    summaryText0.classList.add('i0');
    summaryDiv.appendChild(summaryText0);
    summaryDiv.innerHTML += '<br>';

    const summaryText1 = document.createElement('span');
    summaryText1.textContent = personality;
    summaryText1.classList.add('i1');
    summaryDiv.appendChild(summaryText1);
    summaryDiv.innerHTML += '<br>';

    const summaryText2 = document.createElement('span');
    summaryText2.textContent = personalitiesObj[personality][0];
    summaryText2.classList.add('i2');
    summaryDiv.appendChild(summaryText2);

    divQANDA.appendChild(summaryDiv);

    




    const infoText = document.createElement('h3');
    infoText.textContent = "Based off your personality, below are some events we think you'll like!";
    divQANDA.appendChild(infoText);

    const divEvents = document.createElement('div');
    divEvents.className = 'resultsContainer';

    // loop through every event listed and construct them
    for (let i = 1; i < personalitiesObj[personality].length; i++){
        let event = personalitiesObj[personality][i]
        //check if event exists in events.csv
        if(eventsObj.hasOwnProperty(event))
        {
            let eventURL = eventsObj[event][2];

            // create box for event
            const divEvent = document.createElement('div');
            divEvent.className = 'event-div';

            // create texts
            const eventTypeText = document.createElement('span');
            if(i == 1 || i == 2){
                eventTypeText.textContent = "EXPERIENCE OR ACTIVITY";
            }
            else if (i == 3 || i == 4){
                eventTypeText.textContent = "SHOW";
            }
            else{
                eventTypeText.textContent = "EXHIBITION";
            }
            eventTypeText.classList.add('i0');
            divEvent.appendChild(eventTypeText);
            divEvent.innerHTML += '<br>';

            // event name
            const eventNameText = document.createElement('span');
            eventNameText.textContent = event;
            eventNameText.classList.add('i1');
            divEvent.appendChild(eventNameText);
            divEvent.innerHTML += '<br>';

            // artist name
            const artistNameText = document.createElement('span');
            artistNameText.textContent = eventsObj[event][0];
            artistNameText.classList.add('i2');
            divEvent.appendChild(artistNameText);
            divEvent.innerHTML += '<br>';

            // image
            const imgElement = document.createElement('img');
            imgElement.classList.add('img-event');
            imgElement.src = 'Assets/eventimages/' + event + ' 1080x1080px.jpg';
            divEvent.appendChild(imgElement); 


            // visit button
            var visitButton = document.createElement('button')
            visitButton.className = 'visitButton';
            visitButton.textContent = 'Visit'
            visitButton.addEventListener('click', function() {
                window.open(eventURL, '_blank');
            });

            divEvent.appendChild(visitButton);


            divEvents.appendChild(divEvent);
        }
        else
        {
            console.log("Couldn't find: " + event);
        }
        
    }
    divQANDA.appendChild(divEvents);
}

function lockAllButtons()
{
    const buttons = document.querySelectorAll('button');

    // Loop through each button and disable it
    buttons.forEach(function(button) {
        button.disabled = true;
    });
}

function incrementScores(personality, points) 
{
    lockAllButtons();

    if (scoresObj.hasOwnProperty(personality))
    {
        scoresObj[personality] += parseInt(points);
    }
    else
    {
        scoresObj[personality] = parseInt(points);
    }
    console.log(scoresObj)
    nextQuestion();
}

async function nextQuestion()
{
    startJiggle();

    clearElemAnim("Q&A");
    await delay(1000);

    clearElem("Q&A");

    if(questionList.length > 0)
    {
        constructQANDA(questionList[0]);
    }
    else {
        constructResults();
    }
    
}

async function startQuestions()
{
    lockAllButtons();

    // Retrieve all questions and answers
    questionList = await getQuestions();
    console.log(questionList)
    nextQuestion()
}

function startJiggle() {
    // Add the 'jiggle-animation' class to all SVG elements
    const svgs = document.querySelectorAll('.svg-layer');

    svgs.forEach(svg => svg.classList.add('jiggle-animation'));

    // Remove the 'jiggle-animation' class after the animation duration (1 second)
    setTimeout(() => {
        svgs.forEach(svg => svg.classList.remove('jiggle-animation'));
    }, 1000);
}

async function getQuestions()
{
    let questionObjCSV = await getCSV("Quiz/questions.csv");

    let questionList = [];
    let questionText = "";
    let questionAnswers = [];
    for (let i = 1; i < questionObjCSV.length-1; i++) {
        if(questionObjCSV[i][1]==""){
            let question = {};
            question.text = questionText;
            question.answers = Array.from(questionAnswers);
            questionList.push(question);

            questionAnswers = [];
            questionText = "";
        }
        else{
            if(questionObjCSV[i][0]!=""){
                questionText = questionObjCSV[i][0];
            }
            let questionAnswer = {};
            questionAnswer.text = questionObjCSV[i][1]
            questionAnswer.personality = questionObjCSV[i][2]
            questionAnswer.points = questionObjCSV[i][3]
            questionAnswers.push(questionAnswer);
        }

        //console.log(questionObjCSV[i]);
    }
    let question = {};
    question.text = questionText;
    question.answers = Array.from(questionAnswers);
    questionList.push(question);


    return questionList;
}

async function getPersonalities()
{
    let personalitiesObj = {};

    let personalitiesCSV = await getCSV("Quiz/personalities.csv");
    
    for (let i = 1; i < personalitiesCSV.length-1; i++) {
        personalitiesObj[personalitiesCSV[i][0]] = personalitiesCSV[i].slice(1)
    }

    return personalitiesObj;
}

async function getEvents()
{
    let eventsObj = {};

    let eventsCSV = await getCSV("Quiz/events.csv");
    
    for (let i = 1; i < eventsCSV.length-1; i++) {
        eventsObj[eventsCSV[i][0]] = eventsCSV[i].slice(1)
    }
    

    return eventsObj;
}

document.addEventListener('DOMContentLoaded', function () {
    constructIntro();
});