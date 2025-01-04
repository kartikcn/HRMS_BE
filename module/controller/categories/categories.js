const categoriesService = require("../../services/categoryService");
class categories {
    constructor() {
        console.log('questionnaire');
    }
    async process(data, authData) {
        try {
            let response = await categoriesService.getCategories(data);
            return response;       
        } catch(e){
            console.log(e)
        }
    }
}
module.exports = categories;