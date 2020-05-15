'use strict'

const Event = use("App/Models/Event");
const User = use("App/Models/User");
const Band = use("App/Models/Band");

const Database = use("Database");
const parser = require("xml2js").parseStringPromise;
const soapRequest = require("easy-soap-request");

class SearchController {
    async show({ view, request, response, params }) {
        const events = await Event.all()
        const bands = await Band.all()
        const countries = await getAllCountries()
        console.log(request)
        // const cities = await getCities()
        return view.render("order.search", {
          events: events.toJSON(),
          countries: countries,
          bands: bands.toJSON()
        //   params:params
        //   cities: cities
        });
      };

    async update({view, request, response, params}){
      const bands = await Band.all()
      const countries = await getAllCountries()
      const final = request.only(['band_name', 'state', 'date'])
      let events = []
      if(final.state == 'Choose country'){
        events = await Event.all()
      }
      else{
        events = await Event.query().where('country', final.state).fetch()
      } 
      events = events.toJSON()
      
      if(final.band_name == "Choose band"){
        const band = await Band.all()
      }
      else{
          const band = await Band.query().where('id', final.band_name).first()
          events = events.filter(event => final.band_name == event.usporiadatel)

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
          bands: bands.toJSON()
        });  
    };
};


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