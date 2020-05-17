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
        var timeInMs = Date.now();

        for (let e in events) {
          let values = await getForecast(events[e].city, events[e].date)
          events[e].forecast = values[0]
          events[e].acity = values[1][0].name
          events[e].adate = events[e].date.toString().substr(0,15)
          events[e].atime = events[e].date.toString().substr(16,16)

          let probabs = await getProbab(events[e].city, events[e].date)
          let time_diff = events[e].date.getTime() - timeInMs
          if(time_diff > 864000000){ //864000000 ms == 10 days
            events[e].probab = 'It is too far in the future'
          }else{
            events[e].probab = (probabs[0] *100).toFixed(2)
          }
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

      var timeInMs = Date.now();

      for (let e in events) {
        let values = await getForecast(events[e].city, events[e].date)
        events[e].forecast = values[0]
        events[e].acity = values[1][0].name
        events[e].adate = events[e].date.toString().substr(0,15)
        events[e].atime = events[e].date.toString().substr(16,16)

        let probabs = await getProbab(events[e].city, events[e].date)
        let time_diff = events[e].date.getTime() - timeInMs
        if(time_diff > 864000000){ //864000000 ms == 10 days
          events[e].probab = 'It is too far in the future'
        }else{
          events[e].probab = (probabs[0] *100).toFixed(2)
        }
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

  async function getCity(city_name) {
    console.log(city_name)
    var xmlData = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:typ="http://pis.predmety.fiit.stuba.sk/pis/geoservices/cities/types">
    <soapenv:Header/>
    <soapenv:Body>
       <typ:getByName>
          <name>`+ 
          city_name
          + `</name>
       </typ:getByName>
    </soapenv:Body>
  </soapenv:Envelope>`;
    const { response } = await soapRequest({
      url: "http://pis.predmety.fiit.stuba.sk/pis/ws/GeoServices/Cities",
      xml: xmlData,
      headers: {
        "Content-Type": "application/xml",
      },
    });
    console.log(response)

    const { body } = response;
    return parser(body)
      .then((data) => {
        let parsedData = JSON.parse(JSON.stringify(data));
        let city =
          parsedData["SOAP-ENV:Envelope"]["SOAP-ENV:Body"][0]['ns1:getByNameResponse'][0]['city'];
        return city;
      })
      .catch((err) => console.log(err));
  }

  async function getForecast(city_name, date) {

    var city = await getCity(city_name)
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
        return [temp, city];
      })
      .catch((err) => console.log(err));
  }

  async function getProbab(city_name, date) {

    var city = await getCity(city_name)
    var xmlData = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:typ="http://pis.predmety.fiit.stuba.sk/pis/weatherforecast/types">
    <soapenv:Header/>
    <soapenv:Body>
       <typ:getPrecipitationProbability>
          <date>`+ date.getFullYear()+'-' + (date.getMonth()+1) + '-'+date.getDate() +`</date>
          <coord_lat>`+ city[0].coord_lat + `</coord_lat>
          <coord_lon>`+ city[0].coord_lon + `</coord_lon>
       </typ:getPrecipitationProbability>
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
          parsedData["SOAP-ENV:Envelope"]["SOAP-ENV:Body"][0]['ns1:getPrecipitationProbabilityResponse'][0]['probability'][0];
        return [temp, city];
      })
      .catch((err) => console.log(err));
  }

module.exports = SearchController