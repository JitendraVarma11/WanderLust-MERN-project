const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken=process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
  const alllistings = await Listing.find({});
  

  res.render("./listings/index.ejs", { alllistings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("./listings/new.ejs");
};

module.exports.showListings = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    res.redirect("/listings");
  }
  res.render("./listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
  let response=await geocodingClient.forwardGeocode({
    query:req.body.listing.location,
    limit:1,
  })
  .send();
  // let {title ,description,image,price,country,}=req.body;
  // let listing=req.body.listing;//easy way for above syntax
  let url=req.file.path;
  let filename=req.file.filename;
  const newListing = new Listing(req.body.listing); //create a instance of Listing
  newListing.owner = req.user._id;
  newListing.image={url,filename};

  newListing.geometry=response.body.features[0].geometry;
  await newListing.save();
  req.flash("success", "New listing is created");
  res.redirect("/listings");
};

module.exports.editListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    res.redirect("/listings");
  };

  let orginalImageUrl=listing.image.url;
  orginalImageUrl= orginalImageUrl.replace("/upload","/upload/w_250");
  res.render("./listings/edit.ejs", { listing,orginalImageUrl});
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing =await Listing.findByIdAndUpdate(id, { ...req.body.listing });
 
  if(typeof req.file!== "undefined"){
  let url=req.file.path;
  let filename=req.file.filename;
  listing.image={url,filename};
  await listing.save();
  }
  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};

module.exports.category=async(req,res)=>{
  let { category } = req.params;
  const alllistings = await Listing.find({category:category});
  if (alllistings.length===0) {
    req.flash("error", "No data found for specified category!");
    res.redirect("/listings");
  }else{
  res.render("./listings/category.ejs", { alllistings });
  }
};

module.exports.search=async (req, res) => {
  const query = req.query.q;
  
  if (!query) {
    req.flash("error", "Please provide a search query");
    return res.redirect("/listings");
  }

  const regex = new RegExp(query, "i");

  let data = await Listing.find({
    $or: [
      { location: { $regex: regex } },
      { country: { $regex: regex } },
      { title:{$regex:regex } },
    ],
  });

  if (data.length > 0) {
    res.render("./listings/search.ejs", { data });
  } else {
    req.flash("error", "No result found!");
    res.redirect("/listings");
  }
}
