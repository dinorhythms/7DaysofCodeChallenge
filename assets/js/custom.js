// IndexedDB
function createDB (){
    // Add DB
    let indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;
    let IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction;
    let db;
  
    // Open (or create) the database
    let request = indexedDB.open("CurrencyDB", 1);
  
    request.onsuccess = function (evt) {
        let db = request.result;                                                            
    };
  
  
    request.onerror = function (evt) {
        console.log("IndexedDB error: " + evt.target.errorCode);
    };
  
    // Create the schema
    request.onupgradeneeded = function (evt) {                   
        const countries = evt.currentTarget.result.createObjectStore( "countries", { keyPath: "id", autoIncrement: true });
        const currency  = evt.currentTarget.result.createObjectStore( "currency", { keyPath: "id"});
    };
};

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
    .then(function(reg) {
      // registration worked
      console.log('Registration succeeded. Scope is ' + reg.scope);
      
    }).catch(function(error) {
      // registration failed
      console.log('Registration failed with ' + error);
    });

    createDB ();
    
}

// Get Countries and append to document
const currency1 = document.getElementById('fromCurrency');
const currency2 = document.getElementById('toCurrency');

const geturl = 'https://free.currencyconverterapi.com/api/v5/currencies';

//get records in db to display
let dbrequest = indexedDB.open("CurrencyDB", 1);

dbrequest.onsuccess = function (evt) {

    let db = dbrequest.result;
    let transaction = db.transaction("countries", "readwrite");
    let dbcountries = transaction.objectStore("countries");
    let countRequest = dbcountries.count();

    countRequest.onsuccess = function () {
        
        if(countRequest.result === 0) {

            // No Record in DB, fetch record.
            fetch(geturl)
                .then((response) => response.json())
                .then((data) => {

                    let countries = data.results;

                    for (var key in countries) {
                        if (countries.hasOwnProperty(key)) {

                            //CREATE A SELECT OPTION AND ASSIGN VALUES
                            var option      = document.createElement("option");
                            option.text     = countries[key].id+' '+countries[key].currencyName;
                            option.value    = countries[key].id;
                            //APPEND TO PARENT
                            currency1.appendChild(option);
                            
                            //CREATE A SELECT OPTION AND ASSIGN VALUES
                            var option      = document.createElement("option");
                            option.text     = countries[key].id+' '+countries[key].currencyName;
                            option.value    = countries[key].id;
                            //APPEND TO PARENT
                            currency2.appendChild(option);

                            //Add to DB
                            let transaction2 = db.transaction("countries", "readwrite");
                            let addcountries = transaction2.objectStore("countries");
                            addcountries.put(countries[key]);
                        }
                    }

                })
                .catch((error) => {
                    console.log('Request failed', error)
                });
        } else {
            // Return DB Data
            let transaction2 = db.transaction("countries", "readwrite");
            let getcountries = transaction2.objectStore("countries");
            let getRequest   = getcountries.getAll();

            getRequest.onsuccess = function () {
                // console.log(getRequest.result);

                let countries = getRequest.result;

                for (var key in countries) {
                    if (countries.hasOwnProperty(key)) {

                        //CREATE A SELECT OPTION AND ASSIGN VALUES
                        var option      = document.createElement("option");
                        option.text     = countries[key].id+' '+countries[key].currencyName;
                        option.value    = countries[key].id;
                        //APPEND TO PARENT
                        currency1.appendChild(option);
                        
                        //CREATE A SELECT OPTION AND ASSIGN VALUES
                        var option      = document.createElement("option");
                        option.text     = countries[key].id+' '+countries[key].currencyName;
                        option.value    = countries[key].id;
                        //APPEND TO PARENT
                        currency2.appendChild(option);

                        //Add to DB
                        let transaction2 = db.transaction("countries", "readwrite");
                        let addcountries = transaction2.objectStore("countries");
                        addcountries.put(countries[key]);
                    }
                }
            }
        }
        
    }
}

document.getElementById("convertbtn").onclick = function () { 

    let amount = document.getElementById('amount').value;
    let fromCurrency = document.getElementById('fromCurrency').value;
    let toCurrency = document.getElementById('toCurrency').value;

    fromCurrency = encodeURIComponent(fromCurrency);
    toCurrency = encodeURIComponent(toCurrency);
    var query = fromCurrency + '_' + toCurrency;

    var url = 'https://free.currencyconverterapi.com/api/v5/convert?q='+ query;

    //Check if available in DB first
    let db = dbrequest.result;
    let transaction3 = db.transaction("currency", "readwrite");
    let dbcurrency = transaction3.objectStore("currency");
    let currencyRequest = dbcurrency.get(fromCurrency + '_' + toCurrency);

    currencyRequest.onsuccess= () => {
        // console.log(currencyRequest.result);
        if (currencyRequest.result != undefined) {
            
            // console.log('ID exists', currencyRequest.result);
            let result = currencyRequest.result;

            //Work on data
            let val = result.val;
            let cur = result.to;
            
            if (val) {
                let total = val * amount;
                let converted_amount = (Math.round(total * 100) / 100);
                // console.log(data);
                document.getElementById("result_box").innerHTML = cur+' '+converted_amount;
            } else {
                let err = new Error("Value not found for " + query);
                console.log(err);
            }

        } else {
            
            // No Record Then fetch and add
            fetch(url)
            .then((response) => response.json())
            .then((data) => {

                let record = data.results;
                let result = record[query];

                //Work on data
                let val = result.val;
                let cur = result.to;
                
                if (val) {
                    let total = val * amount;
                    let converted_amount = (Math.round(total * 100) / 100);
                    // console.log(data);
                    document.getElementById("result_box").innerHTML = cur+' '+converted_amount;
                } else {
                    let err = new Error("Value not found for " + query);
                    console.log(err);
                }
                
                //Add to db
                let transaction2 = db.transaction("currency", "readwrite");
                let addcurrency = transaction2.objectStore("currency");
                addcurrency.put(result);
            })

        }
    }

    if (dbcurrency.get(query).onsuccess) {
        

    } else {
        
    }

};

// Check if user is online to update records
window.addEventListener('online', function(e) {
    
    console.log('Back Online');

    //Add to DB
    let dbrequest = indexedDB.open("CurrencyDB", 1);

    //fetch new country data and update in indexDB and DOM
    fetch(geturl)
    .then((response) => response.json())
    .then((data) => {

        let countries = data.results;

        dbrequest.onsuccess = function (evt) {

            let db = dbrequest.result;
            let transaction2 = db.transaction("countries", "readwrite");
            let addcountries = transaction2.objectStore("countries");
            
            for (var key in countries) {
                if (countries.hasOwnProperty(key)) {

                    //CREATE A SELECT OPTION AND ASSIGN VALUES
                    var option      = document.createElement("option");
                    option.text     = countries[key].id+' '+countries[key].currencyName;
                    option.value    = countries[key].id;
                    //APPEND TO PARENT
                    currency1.appendChild(option);
                    
                    //CREATE A SELECT OPTION AND ASSIGN VALUES
                    var option      = document.createElement("option");
                    option.text     = countries[key].id+' '+countries[key].currencyName;
                    option.value    = countries[key].id;
                    //APPEND TO PARENT
                    currency2.appendChild(option);
                    
                    // Add to DB
                    addcountries.put(countries[key]);
                }
            }

            console.log('countries updated');

        }

    })
    .catch((error) => {
        console.log('Request failed', error)
    });

    // fetch currency update
    dbrequest.onsuccess = function (evt) {

        let db = dbrequest.result;
        let transaction3 = db.transaction("currency", "readwrite");
        let dbcurrency = transaction3.objectStore("currency");
        let currencyRequest = dbcurrency.getAll();

        currencyRequest.onsuccess = function() {

            let dbdata = currencyRequest.result;

            dbdata.forEach(function(currencyrecord) {

                let updatequery = currencyrecord.id

                updateurl = 'https://free.currencyconverterapi.com/api/v5/convert?q='+ updatequery;

                fetch(updateurl)
                .then((response) => response.json())
                .then((data) => {
                    
                    let record = data.results;
                    let result = record[updatequery];
                    
                    //Add to db
                    let transaction2 = db.transaction("currency", "readwrite");
                    let addcurrency = transaction2.objectStore("currency");
                    addcurrency.put(result);

                })
                .catch((error) => {
                    console.log('Request failed', error)
                });
            });

            console.log('currency rates updated');
        }
    }

}, false);

