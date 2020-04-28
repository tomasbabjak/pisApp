'use strict'

const Event = use("App/Models/Event");
const User = use("App/Models/User");

const Database = use("Database");
const parser = require("xml2js").parseStringPromise;
const soapRequest = require("easy-soap-request");

class SearchController {
    async show({ view, request, response, params }) {
        const events = await Event.all()
        const countries = await getAllCountries()
        console.log(request)
        // const cities = await getCities()
        return view.render("order.search", {
          events: events.toJSON(),
          countries: countries,
        //   params:params
        //   cities: cities
        });
      };

    async update({view, request, response, params}){
        var events = await Event.all()
        events = events.toJSON()
        const countries = await getAllCountries()
        const final = request.only(['band_name', 'state', 'date'])

        if(final.band_name){
            const user = await User.query().where('fname', final.band_name).first()
            console.log(user)
            if(!user){
                console.log('User not found')
                return
            }
            events = events.filter(event => user.id == event.usporiadatel)
            if(!events){
                console.log('User has no events')
                return
            }
        }
        if(final.date){
            var result = events.filter(event => event.date.toISOString().substr(0,10) == final.date)
        }
        else {
            var result = events
        }
        return view.render("order.search", {
            events: result,
            countries: countries,
          });  
    };
};

async function getCities() {
    var idcka = ''
    for(let i = 6; i < 300; i++){
        idcka = idcka + '<id>'+i+'</id>'
    }
    var xmlData = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:typ="http://pis.predmety.fiit.stuba.sk/pis/geoservices/cities/types">
    <soapenv:Header/>
    <soapenv:Body>
       <typ:getAll>
       </typ:getAll>
    </soapenv:Body>
  </soapenv:Envelope>`;
  
    const { response } = await soapRequest({
      url: "http://pis.predmety.fiit.stuba.sk/pis/ws/GeoServices/Cities",
      xml: xmlData,
      headers: {
        "Content-Type": "application/xml",
      },
    });
    const { body } = response;
    // console.log(body)
    return parser(body)
      .then((data) => {
        let parsedData = JSON.parse(JSON.stringify(data));
        let cities =
          parsedData["SOAP-ENV:Envelope"]["SOAP-ENV:Body"][0]['ns1:getAllResponse'][0]['cities'];
        //   console.log(cities)
        return cities;
      })
      .catch((err) => console.log(err));
  }

async function getAllCountries() {
    var idcka = ''
    for(let i = 6; i < 300; i++){
        idcka = idcka + '<id>'+i+'</id>'
    }
    var xmlData = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:typ="http://pis.predmety.fiit.stuba.sk/pis/geoservices/countries/types">
    <soapenv:Header/>
    <soapenv:Body>
       <typ:getByIds>
          <ids>`+ 
          idcka
          + `</ids>
       </typ:getByIds>
    </soapenv:Body>
  </soapenv:Envelope>`;
  
    const { response } = await soapRequest({
      url: "http://pis.predmety.fiit.stuba.sk/pis/ws/GeoServices/Countries",
      xml: xmlData,
      headers: {
        "Content-Type": "application/xml",
      },
    });
    const { body } = response;
    // console.log(body)
    return parser(body)
      .then((data) => {
        let parsedData = JSON.parse(JSON.stringify(data));
        let countries =
          parsedData["SOAP-ENV:Envelope"]["SOAP-ENV:Body"][0]['ns1:getByIdsResponse'][0]['countries'][0]['country'];
        //   console.log(countries)
        return countries;
      })
      .catch((err) => console.log(err));
  }

module.exports = SearchController