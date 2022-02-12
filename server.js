const express = require('express');
const fs = require('fs');
const { type } = require('os');
const path = require('path');

//const animalsArray = [];

const PORT = process.env.PORT || 3001;
const app = express();

//parse incoming string
app.use(express.urlencoded({ extended: true}));
//parse incoming JSON data
app.use(express.json());

const { animals } = require('./data/animals.json')


//app.get('/api/animals', (req, res) => {
//    res.json(animals);
//});

app.listen(PORT, () => {
    console.log(`API server now on port ${PORT}!`);
});

function filterByQuery(query, animalsArray) {
    let personalityTraitsArray = [];
    //save animalsArray as filteredResults
    let filteredResults = animalsArray;
    if (query.personalityTraits) {
        //save personality traits as an array
        //if personality traits is a astring save it in a new array
        if(typeof query.personalityTraits === 'string') {
            personalityTraitsArray = [query.personalityTraits];
        } else {
            personalityTraitsArray = query.personalityTraits;
        }
        //loops through the personality traits
        personalityTraitsArray.forEach(trait => {
            filteredResults = filteredResults.filter (
                animal => animal.personalityTraits.indexOf(trait) !== -1
            );
        });
    }
    if (query.diet) {
        filteredResults = filteredResults.filter(animal => animal.diet === query.diet);
    }
    if (query.species) {
        filteredResults = filteredResults.filter(animal => animal.species === query.species);
    }
    if (query.name) {
        filteredResults = filteredResults.filter(animal => animal.name === query.name);
    }
    //returns the filtered results
    return filteredResults;
   
};

function findById(id, animalsArray) {
    const result = animalsArray.filter(animal => animal.id === id)[0];
    return result;
};

function createNewAnimal(body, animalsArray) {
  const animal = body;
  animalsArray.push(animal);
  fs.writeFileSync(
      path.join(__dirname, './data/animals.json'),
      JSON.stringify({ animals: animalsArray }, null, 2)
  );
    return animal;
};

function validateAnimal(animal) {
  if (!animal.name || typeof animal.name !== 'string') {
      return false;
  }
  if (!animal.species || typeof animal.species !== 'string') {
      return false;
  }
  if (!animal.diet || typeof animal.diet !== 'string') {
      return false;
  }
  if (!animal.personalityTraits || typeof animal.personalityTraits !== 'string') {
      return false;
  }
  return true;
}

app.get('/api/animals', (req, res) => {
    let results = animals;
    if (req.query) {
        results = filterByQuery(req.query, results);
    }
    
    res.json(results);
});

app.get('/api/animals/:id', (req,res) => {
    const result = findById(req.params.id, animals);
    if (result) {
      res.json(result);
    } else {
      res.send(404);
    }
});

app.post('/api/animals', (req,res) => {
  //set id based on what the next index of the array will be
  req.body.id = animals.length.toString();

  //add animal to json file 
  //validation and posting
  if (!validateAnimal(req.body)) {
      res.status(400).send('The animal is not prperly formatted.');
  } else {
      const animal = createNewAnimal(req.body, animals);
      res.json(animal);
  }
});