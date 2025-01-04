const activityService = require("../../services/activityService");

class create {
    constructor() {
        console.log(' ----->  create activity');
    }
    async process(data, authData) {
        try {
            if(data['command'][0]['function'] != "" && typeof(this[data['command'][0]['function']]) === 'function') {
                var function_name = data['command'][0]['function'];
                let result = await this[function_name](data, authData);
                return result;
            } else {
                let response = await activityService.create(data);
                return response;
            }
        } catch(e){
            console.log(e)
        }
    }

    async saveactivity_details(data, authData) {
      try {
        let response = await activityService.saveactivity_details(data, authData);
        return response;
      } catch(e) {
        console.log(e)
      }
    }
    
    async listActivityType(data, authData) {
      try {
        let response = await activityService.listActivityType(data, authData);
        return response;
      } catch(e) {
        console.log(e)
      }
    }
    
    async activityTypeDetails(data, authData) {
      try {
        let response = await activityService.activityTypeDetails(data, authData);
        return response;
      } catch(e) {
        console.log(e)
      }
    }
    
    async activityList(data, authData) {
      try {
        let response = await activityService.activityList(data, authData);
        return response;
      } catch(e) {
        console.log(e)
      }
    }
    
    
    async activityViewMore(data, authData) {
      try {
        let response = await activityService.activityViewMore(data, authData);
        return response;
      } catch(e) {
        console.log(e)
      }
    }
    
    async activityDetails(data, authData) {
      try {
        let response = await activityService.activityDetails(data, authData);
        return response;
      } catch(e) {
        console.log(e)
      }
    }
    
    async activitiesPerCommunity(data, authData) {
      try {
        let response = await activityService.activitiesPerCommunity(data, authData);
        return response;
      } catch(e) {
        console.log(e)
      }
    }

    async add_activity_badge(data, authData) {
      try {
        let response = await activityService.add_activity_badge(data, authData);
        return response;
      } catch(e) {
        console.log(e)
      }
    }

    async add_activity_score(data, authData) {
      try {
        let response = await activityService.add_activity_score(data, authData);
        return response;
      } catch(e) {
        console.log(e)
      }
    }

    async activity_analytics_view_Detail(data, authData) {
      try {
        let response = await activityService.activity_analytics_view_Detail(data, authData);
        return response;
      } catch(e) {
        console.log(e)
      }
    }

    async activity_analytics_export_Detail(data, authData) {
      try {
        let response = await activityService.activity_analytics_export_Detail(data, authData);
        return response;
      } catch(e) {
        console.log(e)
      }
    }
}
module.exports = create;