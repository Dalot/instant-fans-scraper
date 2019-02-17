const path = require('path');
const exphbs = require('express-handlebars');
const express = require('express');
const bodyParser = require("body-parser");
const request = require("request");

const getSubtitles = require('youtube-captions-scraper').getSubtitles;

const app = express();
const port = 8081;

app.engine('.hbs', exphbs({
  defaultLayout: 'main',
  extname: '.hbs',
  layoutsDir: path.join(__dirname, 'views/layouts')
}));

app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));


//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (request, response) => {
 
    let video_id = request.query.valid;
    if (video_id)
    {
    
    let phrases = new Promise((resolve, reject) => {
        
           getSubtitles({
              videoID: request.query.valid, // youtube video idhttps://www.youtube.com/watch?v=PFOtvHtyW8s
              lang: 'en' // default: `en`
            })
            .then( (result) => {
                
                let arr = [];
                result.forEach((elem) =>
                {
                    arr.push(elem.text);
                });
                resolve(arr);
                  
            })
            .catch((error) => {
                console.log(error);
        });
    });
    
    phrases.then( (aText) => {
           
        let sText = aText.join(" ");
       
            response.render('home', {
            text: sText
        });
      
       })
       .catch((error) => {
           console.log(error);
    });
    
   }
   else
   {
       response.render('home');
   }
   
});

   
     

    
app.post('/video', function(req, res) {
    console.log(req.body);
    let video_url = req.body.video_url;
    console.log(video_url);
    
    function youtube_parser(url){
        var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
        var match = url.match(regExp);
        return (match&&match[7].length==11)? match[7] : false;
    }
    
    let video_id = youtube_parser(video_url);
    
    res.redirect('/?valid=' + video_id);
});
    
    


app.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err);
  }

  console.log(`server is listening on ${port}`);
});

   