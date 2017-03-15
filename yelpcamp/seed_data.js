var campsData = [
    {
      name: "Moss Lake", 
      image: "https://farm9.staticflickr.com/8537/29537096513_db5c3723f7.jpg",
      description: "Mostly Green on the north facing side."
    },
    { 
        name: "Saguaro Springs", 
        image: "https://farm8.staticflickr.com/7459/16358796247_56bc69becd.jpg",
        description: "Prickly pears stand tall with wrens about."
    },
    { 
        name: "Cowell County Park", 
        image: "https://farm9.staticflickr.com/8571/15924490113_af70fc5dff.jpg",
        description: "Dry and filled with mightly Oaks."
    }, 
    { 
        name: "Peyson Wash", 
        image: "https://farm9.staticflickr.com/8001/7578750756_e20931fc90.jpg",
        description: "Wishing for wells when not with water."
    },
    { 
        name: "Oak Creek Canyon", 
        image: "https://farm8.staticflickr.com/7174/6655837043_6b4948557f.jpg",
        description: "Beautiful creekside hiking."
    }
];

// this is more work than is required. Really, I should have just included
// the comments above. 
// However, I am setting myself up to use the Async library later, as a 
// learning exercise. I plan to first create a campground THEN add in comments
// to those DB objects.
var campsComments = [
    "I dig this place",
    "Watch out for the wrankly wrens!",
    "Oh the mightly Oaks.",
    "You better hope it doesn't rain when you're there.",
    "Pleasant river and easy to wade in."
];

module.exports = { campsData, campsComments };

// use the guy below for testing (adding new campground) purposes.
// { name: "Crystal Lake", image: "img/dino-reichmuth-123637.jpg"},
// { name: "Dinosaur Wash", image: "img/martino-pietropoli-169840.jpg"},
// { name: "Guitar Lake", image: "img/andreas-ronningen-37810.jpg"},

// { name: "Ironside Hills", image: "https://farm6.staticflickr.com/5015/5571738694_92686392b7.jpg"}
// { name: "Royal Cascade", image: "https://farm8.staticflickr.com/7172/6585313977_b8dc878384.jpg"},

// these pics from unsplash pics don't render in the application. I'm not 
// sure why.
// { name: "Solace Canyon", image: "https://unsplash.com/search/photos/camp?photo=K9olx8OF36A"},
// { name: "Unknown Lake", image: "https://unsplash.com/search/photos/camp?photo=i9FLJwYhVQs"},
