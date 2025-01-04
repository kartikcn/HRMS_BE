const courseService = require("../../services/courseService");
class course {
    constructor() {
        console.log('course');
    }
    async process(data, authData) {
        if(data['command'][0]['function'] != "" && typeof(this[data['command'][0]['function']]) === 'function') {
            var function_name = data['command'][0]['function'];
            let result = await this[function_name](data, authData);
            return result;
        } else {
            let response = await courseService.create(data, authData);
            return response;
        }
    }
    
    async createContent(data, authData) {
        let response = await courseService.createContent(data, authData);
        return response;
    }

    async updateCourseStatus(data, authData) {
        let response = await courseService.updateCourseStatus(data, authData);
        return response;
    }

    async addCourseAssessment(data, authData) {
        let response = await courseService.addCourseAssessment(data, authData);
        return response;
    }
   
    async getCourseList(data, authData) {
        let response = await courseService.getCourseList(data, authData);
        return response;
    }
    
    async getChapterList(data, authData) {
        let response = await courseService.getChapterList(data, authData);
        return response;
    }
    
    async getModuleList(data, authData) {
        let response = await courseService.getModuleList(data, authData);
        return response;
    }

    async getCourseDetails(data, authData) {
        let response = await courseService.getCourseDetails(data, authData);
        return response;
    }

    async search_course(data, authData) {
        let response = await courseService.search_course(data, authData);
        return response;
    }
    
    async recommended_course(data, authData) {
        let response = await courseService.recommended_course(data, authData);
        return response;
    }
    
    async getAssessmentList(data, authData) {
        let response = await courseService.getAssessmentList(data, authData);
        return response;
    }
    
    async courseTimeLine(data, authData) {
        let response = await courseService.courseTimeLine(data, authData);
        return response;
    }
    
    async popularCourses(data, authData) {
        let response = await courseService.popularCourses(data, authData);
        return response;
    }
    
    async recommended_courseList(data, authData) {
        let response = await courseService.recommended_courseList(data, authData);
        return response;
    }
    
    async deleteModule(data, authData) {
        let response = await courseService.deleteModule(data, authData);
        return response;
    }
    
    async myLearningSave(data, authData) {
        let response = await courseService.myLearningSave(data, authData);
        return response;
    }

    async addFavourite(data, authData) {
        let response = await courseService.addFavourite(data, authData);
        return response;
    }

    async listFavourite(data, authData) {
        let response = await courseService.listFavourite(data, authData);
        return response;
    }

    async remark_data(data, authData) {
        let response = await courseService.remark_data(data, authData);
        return response;
    }

    async createContentEdition(data, authData) {
        let response = await courseService.createContentEdition(data, authData);
        return response;
    }

    async continue_course_Add(data, authData) {
        let response = await courseService.continue_course_Add(data, authData);
        return response;
    }
    async continue_course_list(data, authData) {
        let response = await courseService.continue_course_list(data, authData);
        return response;
    }
    async completed_course_list(data, authData) {
        let response = await courseService.completed_course_list(data, authData);
        return response;
    }

    async content_consumtion(data, authData) {
        let response = await courseService.content_consumtion(data, authData);
        return response;
    }
}
module.exports = course;