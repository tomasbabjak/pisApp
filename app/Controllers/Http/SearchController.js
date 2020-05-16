'use strict'

const Event = use("App/Models/Event");
const User = use("App/Models/User");
const Band = use("App/Models/Band");

const Database = use("Database");
const parser = require("xml2js").parseStringPromise;
const soapRequest = require("easy-soap-request");

class SearchController {
    async show({ view, request, response, params }) {
        var events = await Event.all()
        events = events.toJSON()
        const bands = await Band.all()
        const countries = await getAllCountries()

        for (let e in events) {
          events[e].forecast = await getForecast(events[e].country, events[e].date);
          events[e].adate = events[e].date.toString().substr(0,15)
          events[e].atime = events[e].date.toString().substr(16,16)
        }
        console.log(events)

      return view.render("order.search", {
          events: events,
          countries: countries,
          bands: bands.toJSON()
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

      for (let e in events) {
        events[e].forecast = await getForecast(events[e].country, events[e].date);
        events[e].adate = events[e].date.toString().substr(0,15)
        events[e].atime = events[e].date.toString().substr(16,16)
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

  async function getCity(country) {
    var xmlData = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:typ="http://pis.predmety.fiit.stuba.sk/pis/geoservices/cities/types">
    <soapenv:Header/>
    <soapenv:Body>
       <typ:getCapitalByCountryName>
          <name>`+ 
          country
          + `</name>
       </typ:getCapitalByCountryName>
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
    return parser(body)
      .then((data) => {
        let parsedData = JSON.parse(JSON.stringify(data));
        let city =
          parsedData["SOAP-ENV:Envelope"]["SOAP-ENV:Body"][0]['ns1:getCapitalByCountryNameResponse'][0]['city'];
        return city;
      })
      .catch((err) => console.log(err));
  }

  async function getForecast(country, date) {

    var city = await getCity(country)
    var xmlData = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:typ="http://pis.predmety.fiit.stuba.sk/pis/weatherforecast/types">
    <soapenv:Header/>
    <soapenv:Body>
       <typ:getTemperatureByDate>
          <date>`+ date.getFullYear()+'-' + (date.getMonth()+1) + '-'+date.getDate() +`</date>
          <coord_lat>`+ city[0].coord_lat + `</coord_lat>
          <coord_lon>`+ city[0].coord_lon + `</coord_lon>
       </typ:getTemperatureByDate>
    </soapenv:Body>
  </soapenv:Envelope>`;
    const { response } = await soapRequest({
      url: "http://pis.predmety.fiit.stuba.sk/pis/ws/WeatherForecast",
      xml: xmlData,
      headers: {
        "Content-Type": "application/xml",
      },
    });
    // console.log(response)
    const { body } = response;
    return parser(body)
      .then((data) => {
        let parsedData = JSON.parse(JSON.stringify(data));
        let temp =
          parsedData["SOAP-ENV:Envelope"]["SOAP-ENV:Body"][0]['ns1:getTemperatureByDateResponse'][0]['temperature'][0];
        return temp;
      })
      .catch((err) => console.log(err));
  }


module.exports = SearchController