const currency1 = document.getElementById('fromCurrency');
const currency2 = document.getElementById('toCurrency');

const geturl = 'https://free.currencyconverterapi.com/api/v5/currencies';

fetch(geturl)
    .then((response) => response.json())
    .then((data) => {

        let countries = data.results;

        for (var key in countries) {
            if (countries.hasOwnProperty(key)) {

                //CREATE A SELECT OPTION AND ASSIGN VALUES
                var option      = document.createElement("option");
                option.text     = countries[key].id;
                option.value    = countries[key].id;
                //APPEND TO PARENT
                currency1.appendChild(option);
                
                //CREATE A SELECT OPTION AND ASSIGN VALUES
                var option      = document.createElement("option");
                option.text     = countries[key].id;
                option.value    = countries[key].id;
                //APPEND TO PARENT
                currency2.appendChild(option);
            }
        }

    })
    .catch((error) => {
        console.log('Request failed', error)
});

document.getElementById("convertbtn").onclick = function () { 

    let amount = document.getElementById('amount').value;
    let fromCurrency = document.getElementById('fromCurrency').value;
    let toCurrency = document.getElementById('toCurrency').value;

    fromCurrency = encodeURIComponent(fromCurrency);
    toCurrency = encodeURIComponent(toCurrency);
    var query = fromCurrency + '_' + toCurrency;

    var url = 'https://free.currencyconverterapi.com/api/v5/convert?q='+ query;
    
    fetch(url)
        .then((response) => response.json())
        .then((data) => {

            let record = data.results;
            let result = record[query];

            let val = result.val;
            let cur = result.to;
            
            if (val) {
                let total = val * amount;
                let converted_amount = (Math.round(total * 100) / 100);
                console.log(data);
                document.getElementById("result_box").innerHTML = cur+' '+converted_amount;
            } else {
                let err = new Error("Value not found for " + query);
                console.log(err);
            }

        })
        .catch((error) => {
            console.log('Request failed', error)
        });

};

