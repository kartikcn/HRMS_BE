const Fs = require("fs");
const prjConfig = require("../../config.json");

const getCategories = async function (data) {
    if((data.category).length > 0) {
        var matchQuery = {
            "category_id": { $in: data.category }
        };
    } else {
        var matchQuery = {};
    }
    const BooklistData = await Models.category.aggregate([
        { $match: matchQuery },
        { $sort: { sequence: 1 } },
        // { $skip: (parsedPage - 1) * parsedLimit },
        // { $limit: parsedLimit }
    ]);
    var resp = {
        status: 200,
        result: BooklistData
    }
    data.response =  resp['result'];
    return data;
}
module.exports = {
    getCategories
};