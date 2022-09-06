const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');


mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20)+10;
        const camp = new Campground({
            author: '628e4ad58c0c758e00826944',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description:'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Maxime sequi possimus veniam ab soluta dolores laudantium perferendis nisi. Eaque unde non tenetur quo sunt fuga consequuntur a debitis praesentium enim?',
            price: price,
            geometry:{
                type: "Point",
                coordinates: [cities[random1000].longitude,cities[random1000].latitude]
            },
            images:[
                {
                    url: 'https://res.cloudinary.com/kumarcloud/image/upload/v1653636627/YelpCamp/ju3uxkmbrii4ehsy2p5j.jpg',
                    filename: 'YelpCamp/ju3uxkmbrii4ehsy2p5j',
                },
                {
                    url: 'https://res.cloudinary.com/kumarcloud/image/upload/v1653636620/YelpCamp/hqcam50lxjjcycivsv44.jpg',
                    filename: 'YelpCamp/hqcam50lxjjcycivsv44',
                }
            ],
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})