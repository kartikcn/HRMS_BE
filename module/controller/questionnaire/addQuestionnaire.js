const commonFunction = require("../../services/commonFunctions");
const questionnaireService = require("../../services/questionnaireService.js");
class addQuestionnaire {
    constructor() {
        console.log('questionnaire');
    }
    async process(data, authData) {
        try {
            console.log('cdcdcdcdcd')
            if(data['command'][0]['function'] != "" && typeof(this[data['command'][0]['function']]) === 'function') {
                var function_name = data['command'][0]['function'];
                let result = await this[function_name](data);
                return result;
            } else {
                let response = await commonFunction.addQuestionnaire(data);
                return response;
            }
        } catch(e){
            console.log(e)
        }
    }

    async getQuestionnaire(data) {
        try {
            let response = await questionnaireService.getQuestionnaire(data);
            return response;
        } catch(e) {
            console.log(e)
        }
    }

    async saveQuesResponse(data) {
        try {
            userLogger.info(__filename, 'question create process request ---->  ,' + data);
            let response = await questionnaireService.saveQuesResponse(data);
            return response;
        } catch(e) {
            userLogger.info(__filename, 'error create process request ---->  ,' + e);
            console.log(e)
        }
    }

    async graph_data(data) {
        try {
            userLogger.info(__filename, 'question create process request ---->  ,' + data);
            let response = await questionnaireService.graph_data(data);
            return response;
        } catch(e) {
            userLogger.info(__filename, 'error create process request ---->  ,' + e);
            console.log(e)
        }
    }
}

module.exports = addQuestionnaire;