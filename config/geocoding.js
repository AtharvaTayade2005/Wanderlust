const MAPBOX_TOKEN=process.env.MAPBOX_TOKEN
    && !process.env.MAPBOX_TOKEN.startsWith("your_")
    ? process.env.MAPBOX_TOKEN : null;
const GEOCODE_URL="https://api.mapbox.com/geocoding/v5/mapbox.places/";

async function geocodeLocation(text){
    if(!MAPBOX_TOKEN||!text) return null;
    try{
        const url=`${GEOCODE_URL}${encodeURIComponent(text)}.json?access_token=${MAPBOX_TOKEN}&limit=1`;
        const res=await fetch(url);
        if(!res.ok) return null;
        const data=await res.json();
        const feature=data.features?.[0];
        if(!feature||!feature.center) return null;
        return {
            type:"Point",
            coordinates:feature.center, // [lng, lat]
        };
    }catch(err){
        console.error("geocode failed:",err.message);
        return null;
    }
}

module.exports={geocodeLocation,mapboxToken:MAPBOX_TOKEN};