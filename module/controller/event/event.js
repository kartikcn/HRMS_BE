const eventService = require("../../services/eventService");

class create {
  constructor() {
    console.log(" ----->  create event");
  }
  async process(data, authData) {
    try {
      if (
        data["command"][0]["function"] != "" &&
        typeof this[data["command"][0]["function"]] === "function"
      ) {
        var function_name = data["command"][0]["function"];
        let result = await this[function_name](data, authData);
        return result;
      } else {
        let response = await eventService.create(data, authData);
        return response;
      }
    } catch (e) {
      console.log(e);
    }
  }

  async get_list(data, authData) {
    try {
      let response = await eventService.get_list(data, authData);
      return response;
    } catch (e) {
      console.log(e);
    }
  }

  async view_event(data, authData) {
    try {
      let response = await eventService.view_event(data, authData);
      return response;
    } catch (e) {
      console.log(e);
    }
  }

  async update_event(data, authData) {
    try {
      let response = await eventService.update_event(data, authData);
      return response;
    } catch (e) {
      console.log(e);
    }
  }

  async delete_event(data, authData) {
    try {
      let response = await eventService.delete_event(data, authData);
      return response;
    } catch (e) {
      console.log(e);
    }
  }

  async get_list_for_mobile(data, authData) {
    try {
      let response = await eventService.get_list_for_mobile(data, authData);
      return response;
    } catch (e) {
      console.log(e);
    }
  }

  async event_attendance_add(data, authData) {
    try {
      let response = await eventService.event_attendance_add(data, authData);
      return response;
    } catch (e) {
      console.log(e);
    }
  }

  async view_event_for_mobile(data, authData) {
    try {
      let response = await eventService.view_event_for_mobile(data, authData);
      return response;
    } catch (e) {
      console.log(e);
    }
  }

  async addFaq(data, authData) {
    try {
      let response = await eventService.addFaq(data, authData);
      return response;
    } catch (e) {
      console.log(e);
    }
  }

  async eventConsumerList(data, authData) {
    try {
      let response = await eventService.eventConsumerList(data, authData);
      return response;
    } catch (e) {
      console.log(e);
    }
  }

  async pastEventAttendanceList(data, authData) {
    try {
      let response = await eventService.pastEventAttendanceList(data, authData);
      return response;
    } catch (e) {
      console.log(e);
    }
  }

  async getEventFAQ(data, authData) {
    try {
      let response = await eventService.getEventFAQ(data, authData);
      return response;
    } catch (e) {
      console.log(e);
    }
  }
}
module.exports = create;
