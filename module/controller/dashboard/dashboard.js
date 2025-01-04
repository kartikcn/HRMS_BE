const dashboardService = require("../../services/dashboardService");

class dashboard {
    constructor() {
        console.log(' ----->  dashboard file');
    }
    async process(data, authData) {
        try {
            if(data['command'][0]['function'] != "" && typeof(this[data['command'][0]['function']]) === 'function') {
                var function_name = data['command'][0]['function'];
                let result = await this[function_name](data, authData);
                return result;
            } else {
                let response = await dashboardService.dashboardData(data, authData);
                return response;
            }
        } catch(e){
            console.log(e)
        }
    }

    async exportToCsv(data, authData) {
        let response = await dashboardService.exportToCsv(data, authData);
        return response;
    }
}


module.exports = dashboard;