const auth = require("../../middleware/auth");
const attendanceService = require("../../services/attendanceService");

class attendance {
  constructor() {
    console.log(" ----->  attendance system");
  }
  async process(data, authData) {
    if (
      data["command"][0]["function"] != "" &&
      typeof this[data["command"][0]["function"]] === "function"
    ) {
      var function_name = data["command"][0]["function"];
      let result = await this[function_name](data, authData);
      return result;
    } else {
      let response = await attendanceService.create(data, authData);
      return response;
    }
  }
  async get_attendance_list_id(data, authData) {
    let response = await attendanceService.get_attendance_list_id(
      data,
      authData
    );
    return response;
  }
  async get_user_status_list(data, authData) {
    // Team Online status
    let response = await attendanceService.get_user_status_list(data, authData);
    return response;
  }
  async getUserCalendarData(data, authData) {
    // calendar in dashboard
    let response = await attendanceService.getUserCalendarData(data, authData);
    return response;
  }
  async get_user_attendance_report(data, authData) {
    // attendance report
    let response = await attendanceService.get_user_attendance_report(
      data,
      authData
    );
    return response;
  }
  async exportAttendanceReportToExcel(data) {
    let response = await attendanceService.get_user_attendance_report(data);
    return response;
  }
}
module.exports = attendance;
