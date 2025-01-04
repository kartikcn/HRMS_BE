const course_filter = require("../services/filterService");
const io = require("../../notificationHandler");
// const { sendPushNotification } = require("../../firebaseHandler");

const create = async function (data, authData) {
  try {
    const decoded = Auth.decodeToken(authData);

    if (
      !(
        decoded?.usertype_in === true &&
        decoded?.is_active === true &&
        decoded?.deleted_date == null
      )
    ) {
      data.response = {
        status: 0,
        message: "You are not an admin!!",
      };
      return data;
    }

    if (
      data?.course?.courseedition_id !== undefined &&
      data?.course?.courseedition_id !== null
    ) {
      let up_course_data = await Models.courseEdition.findOneAndUpdate(
        { courseedition_id: data?.course?.courseedition_id },
        { $set: data?.course },
        { new: true }
      );

      let up_community_data = await Models.community.findOneAndUpdate(
        { course_id: data?.course?.courseedition_id },
        {
          $set: {
            community_title: up_course_data?.course_title,
            community_description: up_course_data?.description,
            course_id: up_course_data?.courseedition_id,
            community_type: up_course_data?.course_type,
            is_active: false,
          },
        },
        { new: true }
      );

      if (up_course_data !== null) {
        data.response = {
          result: STATUS.SUCCESS,
          status: 200,
          data: up_course_data,
          message: "Course updated successfully.",
        };
      } else {
        data.response = {
          result: STATUS.ERROR,
          status: 0,
          message: "Course is not updated.",
        };
      }
      return data;
    }

    const CourseInfo = data.course;
    const category = await Models.category
      .findOne({ category_id: CourseInfo.category_id })
      .exec();
    CourseInfo.category_name = category?.category_name;

    const isCourse = await Models.course
      .findOne({
        author_name: CourseInfo?.author_name,
        category_id: CourseInfo?.category_id,
        course_title: CourseInfo?.course_title,
        course_type: CourseInfo?.course_type,
        is_deleted: false,
      })
      .exec();

    const isCourseEdition = await Models.courseEdition
      .findOne({
        author_name: CourseInfo?.author_name,
        category_id: CourseInfo?.category_id,
        course_title: CourseInfo?.course_title,
        course_type: CourseInfo?.course_type,
        is_deleted: false,
      })
      .exec();

    if (isCourse || isCourseEdition) {
      data.response = {
        status: 201,
        message: "Course already exists",
      };
      return data;
    } else {
      const courseEdition = new Models.courseEdition(CourseInfo);
      if (CourseInfo["status"] != 4) {
        let savedEdition;
        let saveLog;
        try {
          savedEdition = await courseEdition.save();
          const logData = {
            course_id: savedEdition?.course_id
              ? savedEdition?.course_id
              : savedEdition?.courseedition_id,
            action: "Initiated",
          };
          console.log(logData, "logdata");
          const courseEditionLog = new Models.courseLog(logData);
          saveLog = await courseEditionLog.save();
          console.log(saveLog, "savelog");
        } catch (errEd) {
          console.error("Error saving course:", errEd);
        }

        const addCommunity = await new Models.community({
          community_title: CourseInfo?.course_title,
          community_description: CourseInfo?.description,
          course_id: savedEdition?.courseedition_id,
          community_type: CourseInfo?.course_type,
          is_active: false,
        }).save();

        data.response = {
          result: STATUS.SUCCESS,
          status: 200,
          data: savedEdition,
          message: "Course Edition created",
        };
        return data;
      } else {
        let savedCourse;
        const addCourse = new Models.course(CourseInfo);
        try {
          savedCourse = await addCourse.save();
          const logData = {
            course_id: savedCourse?.course_id,
            action: "Initiated",
          };

          const courseEditionLog = new Models.courseLog(logData);
          saveLog = await courseEditionLog.save();
        } catch (err) {
          userLogger.info(__filename, "Error saving course: ---->>," + e);
        }
        // const courseHistory = await commonFunction.courseHistory(add.course_id, decoded?._id, "Created");
        const communityInfo = {
          community_title: CourseInfo?.course_title,
          community_description: CourseInfo?.description,
          course_id: savedCourse?.course_id,
          community_type: CourseInfo?.course_type,
          is_active: false,
        };
        const addCommunity = new Models.community(communityInfo);
        try {
          const saveCommunity = await addCommunity.save();
        } catch (e) {
          userLogger.info(__filename, "Error saving community: ---->>," + e);
          console.error("Error saving community:", e);
        }
        data.response = {
          result: STATUS.SUCCESS,
          status: 200,
          data: savedCourse,
          message: "Course and Community created",
        };
        return data;
      }
    }
  } catch (e) {
    userLogger.info(__filename, "create course error---->>," + e);
  }
};

const createContent = async function (data, authData) {
  try {
    const decoded = Auth.decodeToken(authData);

    if (
      !(
        decoded?.usertype_in === true &&
        decoded?.is_active === true &&
        decoded?.deleted_date == null
      )
    ) {
      data.response = {
        status: 0,
        message: "You are not an admin!!",
      };
      return data;
    }
    var add;
    var chapterData = data?.chapter?.chapter_id;
    if (
      data?.chapter?.chapter_id != undefined &&
      data?.chapter?.chapter_id != ""
    ) {
      const filter = {
        _id: new ObjectId(data.chapter._id),
      };

      add = data?.chapter;
      var update = data?.chapter;
      if (data?.chapter?.remark != "") {
        var chapterLogs = data?.chapter;
        delete data?.chapter?._id;
        let addChapterLog = new Models.chapterLog(chapterLogs);
        console.log(data?.chapter?.remark + "------->>>>>**********");
        try {
          addLog = await addChapterLog.save();
          console.log(JSON.stringify(addLog) + "nccccnn");
        } catch (e) {
          console.log(e);
          userLogger.info(__filename, "add chapter error --->> ," + e);
        }
      }
      if (
        data?.chapter?.is_deleted != undefined &&
        data?.chapter?.is_deleted == true
      ) {
        update.deleted_date = new Date();
        update.deleted_by = decoded?._id;
      }
      delete update.chapter_id;

      add = await Models.chapter.findOneAndUpdate(
        filter,
        { $set: update },
        { new: true }
      );

      if (!add) {
        console.error("Error updating document:", updateErr);
      } else {
        console.log("Document updated successfully");
      }
    } else {
      const ChapterInfo = data.chapter;
      let chapter = {
        chapter_title: ChapterInfo.chapter_title,
        course_id: ChapterInfo.course_id,
      };

      let addChapter = new Models.chapter(chapter);

      try {
        add = await addChapter.save();
      } catch (e) {
        console.log(e);
        userLogger.info(__filename, "add chapter error --->> ," + e);
      }
    }
    const ModuleInfo = data?.chapter?.module;

    for (var i = 0; i < ModuleInfo.length; i++) {
      if (ModuleInfo[i]["_id"] != undefined && ModuleInfo[i]["_id"] != "") {
        let moduleUpdate = {
          module_header: ModuleInfo[i]["module_header"],
          course_id: ModuleInfo[i].course_id,
          module_description: ModuleInfo[i]["module_description"],
          module_link: ModuleInfo[i]["module_link"],
          chapter_id: add?.chapter_id,
        };
        const filterModule = {
          _id: new ObjectId(ModuleInfo[i]["_id"]),
        };
        delete ModuleInfo[i]["module_id"];
        if (
          ModuleInfo[i]["is_deleted"] != undefined &&
          ModuleInfo[i]["is_deleted"] == true
        ) {
          moduleUpdate.deleted_date = new Date();
          moduleUpdate.deleted_by = decoded?._id;
        }
        let updatemodule = await Models.module
          .updateOne(filterModule, moduleUpdate)
          .exec();
        if (!updatemodule) {
          console.error("Error module updating document:", updatemodule);
        } else {
          console.log("Document module updated successfully");
        }
      } else {
        delete ModuleInfo[i]["module_id"];
        delete ModuleInfo[i]["_id"];
        let module = {
          module_header: ModuleInfo[i]["module_header"],
          course_id: ModuleInfo[i].course_id,
          module_description: ModuleInfo[i]["module_description"],
          module_link: ModuleInfo[i]["module_link"],
          chapter_id: add.chapter_id,
        };
        let addModule = new Models.module(module);
        let saveModule;
        try {
          saveModule = await addModule.save();
        } catch (eModule) {
          userLogger.info(__filename, "add module error --->> ," + eModule);
        }
      }
    }
    data.response = {
      result: STATUS.SUCCESS,
      status: 200,
      data: data.chapter,
      message: "Course and Community created",
    };
    return data;
  } catch (eContent) {
    console.log("eContent           ----------->   ", eContent);
    userLogger.info(__filename, "create content error --- >>>>," + eContent);
    data.response = {
      status: 0,
      message: eContent,
    };
    return data;
  }
};

const updateCourseStatus = async function (data, authData) {
  try {
    const decoded = Auth.decodeToken(authData);

    if (
      !(
        decoded?.usertype_in === true &&
        decoded?.is_active === true &&
        decoded?.deleted_date == null
      )
    ) {
      data.response = {
        status: 0,
        message: "You are not an admin!!",
      };
      return data;
    }

    if (data?.status == 4 && data?.flag == "moderator") {
      // Approved
      try {
        if (data.is_active != undefined) {
          console.log("njvbbjbjxc hsjdhhsd hixchixc hishisf hsdhsid kdsds");
          let oldcourse_data = await Models.course
            .findOne({ course_id: data?.course_id })
            .exec();
          console.log(oldcourse_data, "oldcourse");
          let new_update = {
            is_active: data?.is_active,
          };
          var updateCourse = await Models.course.findOneAndUpdate(
            { _id: new ObjectId(oldcourse_data._id) },
            { $set: new_update },
            { new: true }
          );
          console.log("g");
          data.response = {
            result: STATUS.SUCCESS,
            data: updateCourse,
            status: 200,
            message: "Course status updated",
          };
          return data;
        } else {
          let CourseInfo = await Models.courseEdition
            .findOne({ courseedition_id: data.course_id })
            .exec();

          let course_data = await Models.course
            .findOne({ courseedition_id: data.course_id })
            .exec();

          let new_course_data = {
            author_name: CourseInfo?.author_name,
            course_type: CourseInfo?.course_type,
            course_title: CourseInfo?.course_title,
            description: CourseInfo?.description,
            is_deleted: CourseInfo?.is_deleted,
            category_id: CourseInfo?.category_id,
            course_level: CourseInfo?.course_level,
            status: data?.status,
            amount: CourseInfo?.amount,
            discount_amount: CourseInfo?.discount_amount,
            discount_tenure: CourseInfo?.discount_tenure,
            courseedition_id: CourseInfo?.courseedition_id,
            cover_img: CourseInfo?.cover_img,
          };

          var savedCourse;

          if (course_data == null) {
            console.log("                       Save course");
            savedCourse = await new Models.course(new_course_data).save();
          } else {
            console.log("                       Update course");
            savedCourse = await Models.course.findOneAndUpdate(
              { _id: new ObjectId(course_data._id) },
              { $set: new_course_data },
              { new: true }
            );
          }

          var chapterEdition_data = await Models.chapterEdition.aggregate([
            {
              $match: {
                course_id: data.course_id,
              },
            },
            {
              $lookup: {
                from: "moduleeditions",
                localField: "chapterEdition_id",
                foreignField: "chapterEdition_id",
                as: "module_data",
              },
            },
          ]);
          const courseEditionLog = await new Models.courseLog({
            course_id: CourseInfo?.courseedition_id,
            action: "Approved",
            created_by: decoded?._id,
          }).save();
          console.log(courseEditionLog, "courseeditionlog----->>>>>");
          for (var i = 0; i < chapterEdition_data.length; i++) {
            var moduleEdition_data = chapterEdition_data[i].module_data;

            let chapter_data = await Models.chapter
              .findOne({
                chapterEdition_id: chapterEdition_data[i].chapterEdition_id,
              })
              .exec();
            let savedChapter;

            if (chapter_data == null) {
              if (chapterEdition_data[i].deleted_date != null) {
                chapterEdition_data[i].deleted_date = new Date();
              }

              savedChapter = await new Models.chapter({
                chapter_title: chapterEdition_data[i].chapter_title,
                deleted_by: chapterEdition_data[i].deleted_by,
                deleted_date: chapterEdition_data[i].deleted_date,
                course_id: chapterEdition_data[i].course_id, // courseEdition_id
                chapterEdition_id: chapterEdition_data[i].chapterEdition_id,
              }).save();
            } else {
              if (chapterEdition_data[i].deleted_date == null) {
                chapterEdition_data[i].deleted_date = null;
              } else {
                chapterEdition_data[i].deleted_date = new Date();
              }

              savedChapter = await Models.chapter.findOneAndUpdate(
                { _id: new ObjectId(chapter_data._id) },
                {
                  $set: {
                    chapter_title: chapterEdition_data[i].chapter_title,
                    deleted_by: chapterEdition_data[i].deleted_by,
                    deleted_date: chapterEdition_data[i].deleted_date,
                    course_id: chapterEdition_data[i].course_id, // courseEdition_id
                    chapterEdition_id: chapterEdition_data[i].chapterEdition_id,
                  },
                },
                { new: true }
              );
            }

            for (var j = 0; j < moduleEdition_data.length; j++) {
              let module_data = await Models.module
                .findOne({
                  moduleEdition_id: moduleEdition_data[j].moduleEdition_id,
                })
                .exec();
              let savedModule;

              if (module_data == null) {
                if (moduleEdition_data[j].deleted_date != null) {
                  moduleEdition_data[j].deleted_date = new Date();
                }

                savedModule = await new Models.module({
                  module_header: moduleEdition_data[j].module_header,
                  course_id: moduleEdition_data[j].course_id, // courseEdition_id
                  module_description: moduleEdition_data[j].module_description,
                  module_link: moduleEdition_data[j].module_link,
                  module_pdf: moduleEdition_data[j].module_pdf,
                  chapterEdition_id: moduleEdition_data[j].chapterEdition_id,
                  moduleEdition_id: moduleEdition_data[j].moduleEdition_id,
                  deleted_by: moduleEdition_data[j].deleted_by,
                  deleted_date: moduleEdition_data[j].deleted_date,
                  chapter_id: savedChapter.chapter_id,
                }).save();
              } else {
                if (moduleEdition_data[j].deleted_date == null) {
                  moduleEdition_data[j].deleted_date = null;
                } else {
                  moduleEdition_data[j].deleted_date = new Date();
                }

                savedModule = await Models.module.findOneAndUpdate(
                  { _id: new ObjectId(module_data._id) },
                  {
                    $set: {
                      module_header: moduleEdition_data[j].module_header,
                      course_id: moduleEdition_data[j].course_id, // courseEdition_id
                      module_description:
                        moduleEdition_data[j].module_description,
                      module_link: moduleEdition_data[j].module_link,
                      module_pdf: moduleEdition_data[j].module_pdf,
                      chapterEdition_id:
                        moduleEdition_data[j].chapterEdition_id,
                      moduleEdition_id: moduleEdition_data[j].moduleEdition_id,
                      deleted_by: moduleEdition_data[j].deleted_by,
                      deleted_date: moduleEdition_data[j].deleted_date,
                      chapter_id: savedChapter.chapter_id,
                    },
                  },
                  { new: true }
                );
              }
            }
          }

          let updatecourseedition = await Models.courseEdition.findOneAndUpdate(
            {
              courseedition_id: CourseInfo?.courseedition_id,
            },
            {
              $set: {
                status: 4,
              },
            },
            { new: true }
          );

          let updateCommunityStatus = await Models.community.findOneAndUpdate(
            {
              course_id: CourseInfo?.courseedition_id,
            },
            {
              $set: {
                is_active: true,
              },
            },
            { new: true }
          );

          data.response = {
            result: STATUS.SUCCESS,
            status: 200,
            data: savedCourse,
            message: "Course updated",
          };

          var new_course_notif = await new Models.notificationLog({
            type: "Course",
            title: "New Course",
            message: "Check out this new course",
            course_id: savedCourse.course_id,
          }).save();

          var user_record = await Models.user.aggregate([
            {
              $match: {
                deleted_date: null,
                usertype_in: false,
                device_token: {
                  $exists: true,
                },
              },
            },
            {
              $project: {
                device_token: 1,
              },
            },
          ]);

          for (var token_data of user_record) {
            if (
              token_data.device_token !== undefined &&
              token_data.device_token !== null
            ) {
              console.log(
                "token_data       ----------->   ",
                token_data.device_token
              );
              console.log(" ");
              var title = "Course approved";
              var message = "New course added.";
              var notif_token = token_data.device_token;
              var notifyResponse = await sendPushNotification(
                message,
                notif_token,
                title
              );
              console.log("notifyResponse    ------>  ", notifyResponse);
              console.log(" ");
              console.log(
                " --------------------------------------------------- "
              );
            }
          }
          // io.emit('notification', { message: 'Course approved' })
        }
      } catch (err) {
        console.log(err);
        userLogger.info(__filename, "Error saving course: ---->>," + err);
      }
    } else if (data?.status == 1) {
      var course_data = await Models.courseEdition
        .findOne({ courseedition_id: data?.course_id })
        .exec();
      if (
        course_data !== null &&
        course_data.status !== undefined &&
        course_data.status == 2
      ) {
        data.status = 3;
      }
      let updatecourseedition = await Models.courseEdition.findOneAndUpdate(
        {
          courseedition_id: data?.course_id,
        },
        {
          $set: {
            status: data.status,
          },
        },
        { new: true }
      );
      data.response = {
        result: STATUS.SUCCESS,
        status: 200,
        data: updatecourseedition,
        message: "Course updated",
      };
    } else if (data?.status == 0) {
      let updatecourseedition = await Models.courseEdition.findOneAndUpdate(
        {
          courseedition_id: data?.course_id,
        },
        {
          $set: {
            status: 0,
          },
        },
        { new: true }
      );
      data.response = {
        result: STATUS.SUCCESS,
        status: 200,
        data: updatecourseedition,
        message: "Course updated",
      };
    } else if (data?.status == 2) {
      // Rejected
      // const courseEditionLog = await new Models.courseLog({
      //   'course_id': data?.reject_data[0]?.course_id,
      //   'action': 'Rejected',
      //   'created_by': decoded?._id
      // }).save();
      // console.log(courseEditionLog, 'courseeditionlog----->>>>>')

      var updatecourseedition = await Models.courseEdition.findOneAndUpdate(
        {
          courseedition_id: data?.reject_data[0]?.course_id,
        },
        {
          $set: {
            status: data?.status,
          },
        },
        { new: true }
      );

      var remark_data = await Models.courseLog.insertMany(data?.reject_data);

      data.response = {
        result: STATUS.SUCCESS,
        status: 200,
        data: updatecourseedition,
        message: "Course Rejected.",
      };
    } else if (data?.status == 3) {
      // Resubmitted
      var updatecourseedition = await Models.courseEdition.findOneAndUpdate(
        {
          courseedition_id: data?.course_id,
        },
        {
          $set: {
            status: data?.status,
          },
        },
        { new: true }
      );

      data.response = {
        result: STATUS.SUCCESS,
        status: 200,
        data: updatecourseedition,
        message: "Course Rejected.",
      };
    }

    // let updateStatus = await Models.course.findOneAndUpdate({
    //     course_id: data.course_id
    // }, {
    //     $set: {
    //         status: data.status
    //     }
    // }, {new: true});

    // let action;
    // var remark = "";
    // if (data ?. status == 4) {
    //     action = 'Approved';
    // } else if (data ?. status == 1) {
    //     action = 'Submitted';
    // } else if (data ?. status == 2) {
    //     action = 'Rejected';
    //     remark = data ?. remark;
    // } else if (data ?. status == 3) {
    //     action = 'Resubmitted';
    // } else if (data ?. status == 0) {
    //     action = 'Draft';
    // }

    // const logData = {
    //     'course_id': data.course_id,
    //     'action': action,
    //     'remark': remark
    // };
    // const courseEditionLog = new Models.courseLog(logData);
    // saveLog = await courseEditionLog.save();

    return data;
  } catch (e) {
    console.log(e);
    userLogger.info(__filename, "update content error --- >>>>," + e);
  }
};

const addCourseAssessment = async function (data, authData) {
  try {
    const decoded = Auth.decodeToken(authData);

    if (
      !(
        decoded?.usertype_in === true &&
        decoded?.is_active === true &&
        decoded?.deleted_date == null
      )
    ) {
      data.response = {
        status: 0,
        message: "You are not an admin!!",
      };
      return data;
    }
    const question = data.assignment;
    if (question?.assignment_id != undefined && question?.assignment_id != "") {
      const filter = {
        _id: new ObjectId(question?._id),
      };
      delete question?._id;
      if (question.is_deleted == true) {
        question.deleted_date = new Date();
        question.deleted_by = decoded?._id;
      }
      let updateassignment = await Models.assignment.findOneAndUpdate(
        filter,
        { $set: question },
        { new: true }
      );
      if (!updateassignment) {
        console.error("Error updating document:", updateErr);
      } else {
        data.response = {
          result: STATUS.SUCCESS,
          status: 200,
          data: updateassignment,
          message: "Update successfully",
        };
        return data;
      }
    } else {
      delete question?._id;
      const addAssignment = new Models.assignment(question);
      let savedAssignment;
      try {
        savedAssignment = await addAssignment.save();
      } catch (err) {
        userLogger.info(__filename, "create assignment error --- >>>>," + err);
      }
      data.response = {
        result: STATUS.SUCCESS,
        status: 200,
        data: savedAssignment,
        message: "Course Assessment added",
      };
      return data;
    }
  } catch (e) {
    userLogger.info(__filename, "create add assignment error---->>," + e.stack);
    data.response = {
      status: 0,
      message: e.stack,
    };
    return data;
  }
};

const getCourseList = async function (data, authData) {
  console.log("i'm in ");

  try {
    if (Object.keys(data.filter).length !== 0) {
      console.log("data filter    --------->  ", data.filter);
      let record = await course_filter.course_filter(data, authData);
      return record;
    }

    const decoded = Auth.decodeToken(authData);

    if (
      !(
        decoded?.usertype_in === true &&
        decoded?.is_active === true &&
        decoded?.deleted_date == null
      )
    ) {
      data.response = {
        status: 0,
        message: "You are not an admin!!",
      };
      return data;
    }
    var course_status = 0;
    if (data.flag == "Draft") {
      course_status = 0;
    } else if (data.flag == "Submitted" || data.flag == "Pending") {
      course_status = 1;
    } else if (data.flag == "Resubmitted") {
      course_status = 3;
    } else if (data.flag == "Rejected") {
      course_status = 2;
    } else if (data.flag == "Approved" || data.flag == "Published") {
      data.flag = "Approved";
      course_status = 4;
    }

    let skip = data.limit * (data.page_no - 1);

    if (data.flag !== "Approved" && data.flag != "Rejected") {
      if (data.flag == "Moderator_pending") {
        var record = {
          $or: [
            {
              status: 1,
            },
            {
              status: 3,
            },
          ],
        };
      } else {
        var record = {
          status: course_status,
        };
      }

      let is_deleted_record = {
        is_deleted: false,
      };

      var list = await Models.courseEdition
        .aggregate([
          {
            $match: {
              $and: [record, is_deleted_record],
            },
          },
          {
            $sort: {
              updatedAt: -1,
            },
          },
          {
            $lookup: {
              from: "categories",
              localField: "category_id",
              foreignField: "category_id",
              as: "categoryInfo",
            },
          },
          {
            $unwind: {
              path: "$categoryInfo",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $skip: skip,
          },
          {
            $limit: data.limit,
          },
          {
            $project: {
              _id: 1,
              courseedition_id: 1,
              author_name: 1,
              is_active: 1,
              description: 1,
              cover_img: 1,
              course_title: 1,
              course_type: 1,
              createdAt: 1,
              categoryName: "$categoryInfo.category_name",
            },
          },
        ])
        .exec();

      var total = await Models.courseEdition
        .aggregate([
          {
            $match: {
              $and: [record, is_deleted_record],
            },
          },
          {
            $sort: {
              createdAt: -1,
            },
          },
          {
            $lookup: {
              from: "categories",
              localField: "category_id",
              foreignField: "category_id",
              as: "categoryInfo",
            },
          },
          {
            $unwind: {
              path: "$categoryInfo",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              _id: 1,
              courseedition_id: 1,
              is_active: 1,
              author_name: 1,
              description: 1,
              cover_img: 1,
              course_title: 1,
              course_type: 1,
              createdAt: 1,
              categoryName: "$categoryInfo.category_name",
            },
          },
        ])
        .exec();
    } else if (data.flag === "Rejected") {
      console.log(
        "ncjxbcjbxjcbxjbcjxbcjxbcjbjhdshdisdhishdisdhisdhisdhisdhishdisdhishdi"
      );
      var list = await Models.courseEdition
        .aggregate([
          {
            $match: {
              status: course_status,
              is_deleted: false,
            },
          },
          {
            $sort: {
              updatedAt: -1,
            },
          },
          {
            $lookup: {
              from: "categories",
              localField: "category_id",
              foreignField: "category_id",
              as: "categoryInfo",
            },
          },
          {
            $unwind: {
              path: "$categoryInfo",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $skip: skip,
          },
          {
            $limit: data.limit,
          },
          {
            $project: {
              _id: 1,
              courseedition_id: 1,
              author_name: 1,
              is_active: 1,
              description: 1,
              cover_img: 1,
              course_title: 1,
              course_type: 1,
              createdAt: 1,
              categoryName: "$categoryInfo.category_name",
              createdBy: "$courseLogInfo.created_by",
              createdByName: {
                $concat: ["$userInfo.first_name", " ", "$userInfo.last_name"],
              },
            },
          },
        ])
        .exec();
      console.log(list, "list");

      for (var i = 0; i < list.length; i++) {
        var other_data = await Models.courseLog
          .aggregate([
            {
              $match: {
                course_id: list[i].courseedition_id,
              },
            },
            {
              $match: {
                action: "Rejected",
                chapterEdition_id: {
                  $exists: false,
                },
              },
            },
            {
              $sort: {
                createdAt: -1,
              },
            },
            {
              $lookup: {
                from: "users",
                localField: "created_by",
                foreignField: "_id",
                as: "userInfo",
              },
            },
            {
              $unwind: {
                path: "$userInfo",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                createdByName: {
                  $concat: ["$userInfo.first_name", " ", "$userInfo.last_name"],
                },
                createdAt: 1,
              },
            },
          ])
          .exec();

        list[i].createdByName = other_data[0]?.createdByName;
        list[i].createdAt = other_data[0]?.createdAt;
      }

      var total = await Models.courseEdition
        .aggregate([
          {
            $match: {
              status: course_status,
              is_deleted: false,
            },
          },
          {
            $sort: {
              createdAt: -1,
            },
          },
          {
            $lookup: {
              from: "categories",
              localField: "category_id",
              foreignField: "category_id",
              as: "categoryInfo",
            },
          },
          {
            $unwind: {
              path: "$categoryInfo",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              _id: 1,
              courseedition_id: 1,
              author_name: 1,
              is_active: 1,
              description: 1,
              cover_img: 1,
              course_title: 1,
              course_type: 1,
              createdAt: 1,
              categoryName: "$categoryInfo.category_name",
              createdBy: "$courseLogInfo.created_by",
              createdByName: {
                $concat: ["$userInfo.first_name", " ", "$userInfo.last_name"],
              },
            },
          },
        ])
        .exec();
    } else {
      var list = await Models.course
        .aggregate([
          {
            $match: {
              status: course_status,
              is_deleted: false,
            },
          },
          {
            $sort: {
              createdAt: -1,
            },
          },
          {
            $lookup: {
              from: "categories",
              localField: "category_id",
              foreignField: "category_id",
              as: "categoryInfo",
            },
          },
          {
            $unwind: {
              path: "$categoryInfo",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $skip: skip,
          },
          {
            $limit: data.limit,
          },
          {
            $project: {
              _id: 1,
              course_id: 1,
              author_name: 1,
              description: 1,
              is_active: 1,
              cover_img: 1,
              course_title: 1,
              course_type: 1,
              createdAt: 1,
              categoryName: "$categoryInfo.category_name",
              createdBy: "$courseLogInfo.created_by",
              createdByName: {
                $concat: ["$userInfo.first_name", " ", "$userInfo.last_name"],
              },
            },
          },
        ])
        .exec();
      console.log(list, "list");

      for (var i = 0; i < list.length; i++) {
        var other_data = await Models.courseLog
          .aggregate([
            {
              $match: {
                course_id: list[i].course_id,
              },
            },
            {
              $match: {
                action: "Approved",
                // 'chapterEdition_id': {
                //   '$exists': false
                // }
              },
            },
            {
              $lookup: {
                from: "users",
                localField: "created_by",
                foreignField: "_id",
                as: "userInfo",
              },
            },
            {
              $unwind: {
                path: "$userInfo",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                createdByName: {
                  $concat: ["$userInfo.first_name", " ", "$userInfo.last_name"],
                },
              },
            },
          ])
          .exec();

        list[i].createdByName = other_data[0]?.createdByName;
      }

      var total = await Models.course
        .aggregate([
          {
            $match: {
              status: course_status,
              is_deleted: false,
            },
          },
          {
            $sort: {
              createdAt: -1,
            },
          },
          {
            $lookup: {
              from: "categories",
              localField: "category_id",
              foreignField: "category_id",
              as: "categoryInfo",
            },
          },
          {
            $unwind: {
              path: "$categoryInfo",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              _id: 1,
              course_id: 1,
              author_name: 1,
              description: 1,
              is_active: 1,
              cover_img: 1,
              course_title: 1,
              course_type: 1,
              createdAt: 1,
              categoryName: "$categoryInfo.category_name",
              createdBy: "$courseLogInfo.created_by",
              createdByName: {
                $concat: ["$userInfo.first_name", " ", "$userInfo.last_name"],
              },
            },
          },
        ])
        .exec();
    }

    let devident = total.length / data.limit;
    let pages;

    if (devident > parseInt(devident)) {
      pages = parseInt(devident) + 1;
    } else {
      pages = devident;
    }

    data.response = {
      status: 200,
      total_data: total.length,
      total_pages: pages,
      data: list,
      message: "List fetched successfully",
    };
    return data;
  } catch (err) {
    console.log("Error       ------------>  ", err);
  }
};

const getChapterList = async function (data, authData) {
  try {
    // const decoded = Auth.decodeToken(authData);

    // if (!(decoded ?. is_active === true && decoded ?. deleted_date == null)) {
    //     data.response = {
    //         status: 0,
    //         message: "You are not an admin!!"
    //     }
    //     return data;
    // }

    if (data.flag == null) {
      // console.log("    getChapterList     null   --------->   ", data.flag)
      const list = await Models.chapterEdition.aggregate([
        {
          $match: {
            course_id: data.course_id,
            deleted_date: null,
          },
        },
      ]);

      data.response = {
        status: 200,
        data: list,
        message: "chapter fetched successfully",
      };

      return data;
    } else {
      // console.log("    getChapterList     null   --------->   ", data.flag)
      let record = await Models.course
        .findOne({ course_id: data.course_id })
        .exec();

      const list = await Models.chapter.aggregate([
        {
          $match: {
            course_id: record.courseedition_id,
            deleted_date: null,
          },
        },
      ]);

      data.response = {
        status: 200,
        data: list,
        message: "chapter fetched successfully",
      };

      return data;
    }
  } catch (e) {
    userLogger.info(__filename, "error getting chapter --- >>>>," + e);
  }
};

const getModuleList = async function (data, authData) {
  try {
    // const decoded = Auth.decodeToken(authData);

    // if (!(decoded ?. is_active === true && decoded ?. deleted_date == null)) {
    //     data.response = {
    //         status: 0,
    //         message: "You are not an admin!!"
    //     }
    //     return data;
    // }

    if (data.flag == null) {
      console.log("    getModuleList     null   --------->   ", data.flag);
      console.log("    getModuleList     null   --------->   ", data);
      const list = await Models.moduleEdition.aggregate([
        {
          $match: {
            chapterEdition_id: data.chapter_id,
            deleted_date: null,
          },
        },
      ]);

      data.response = {
        status: 200,
        data: list,
        message: "module fetched successfully",
      };

      return data;
    } else {
      console.log("    getModuleList     approve   --------->   ", data.flag);
      console.log("    getModuleList     approve   --------->   ", data);
      const list = await Models.module.aggregate([
        {
          $match: {
            chapter_id: data.chapter_id,
            deleted_date: null,
          },
        },
      ]);

      data.response = {
        status: 200,
        data: list,
        message: "module fetched successfully",
      };

      return data;
    }
  } catch (e) {
    userLogger.info(__filename, "error getting module --- >>>>," + e);
  }
};

const getCourseDetails = async function (data, authData) {
  try {
    const decoded = Auth.decodeToken(authData);

    if (!(decoded?.is_active === true && decoded?.deleted_date == null)) {
      data.response = {
        status: 0,
        message: "You are not an admin!!",
      };
      return data;
    }

    if (data.flag == null) {
      // console.log("    getCourseDetails     null   --------->   ", data.flag)
      var courseInfo = await Models.courseEdition
        .aggregate([
          {
            $match: {
              courseedition_id: data?.course_id,
              deleted_date: null,
            },
          },
          {
            $lookup: {
              from: "categories",
              localField: "category_id",
              foreignField: "category_id",
              as: "categoryInfo",
            },
          },
          {
            $unwind: {
              path: "$categoryInfo",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: "communities",
              localField: "course_id",
              foreignField: "course_id",
              as: "communityInfo",
            },
          },
          {
            $unwind: {
              path: "$communityInfo",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              _id: 1,
              courseedition_id: 1,
              author_name: 1,
              description: 1,
              is_active: 1,
              cover_img: 1,
              course_title: 1,
              course_type: 1,
              dummy_rating: 1,
              createdAt: 1,
              category_id: 1,
              course_level: 1,
              discount_amount: 1,
              discount_tenure: 1,
              amount: 1,
              community: "$communityInfo",
              categoryName: "$categoryInfo.category_name",
            },
          },
        ])
        .exec();
      var resultInfo = {};
      if (courseInfo) {
        resultInfo = courseInfo[0];
      }
      data.response = {
        status: 200,
        message: "Course fetched successfully",
        data: resultInfo,
      };
      return data;
    } else {
      // console.log("    getCourseDetails     Approved   --------->   ", data.flag)
      var courseInfo = await Models.course
        .aggregate([
          {
            $match: {
              course_id: data?.course_id,
              deleted_date: null,
            },
          },
          {
            $lookup: {
              from: "categories",
              localField: "category_id",
              foreignField: "category_id",
              as: "categoryInfo",
            },
          },
          {
            $unwind: {
              path: "$categoryInfo",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: "communities",
              localField: "course_id",
              foreignField: "course_id",
              as: "communityInfo",
            },
          },
          {
            $unwind: {
              path: "$communityInfo",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $lookup: {
              from: "payment_details", // The collection to join.
              let: { course_id: data?.course_id, user_id: data?.user_id }, // Define variables to use in the pipeline.
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ["$course_id", "$$course_id"] }, // Use the variable defined in `let`.
                        { $eq: ["$user_id", "$$user_id"] }, // Additional condition.
                      ],
                    },
                  },
                },
              ],
              as: "payment_detail_info", // The output array field.
            },
          },
          {
            $unwind: {
              path: "$payment_detail_info",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              _id: 1,
              courseedition_id: 1,
              author_name: 1,
              description: 1,
              cover_img: 1,
              course_id: 1,
              is_active: 1,
              course_title: 1,
              course_type: 1,
              amount: 1,
              discount_amount: 1,
              discount_tenure: 1,
              dummy_rating: 1,
              createdAt: 1,
              declined_user: 1,
              community: "$communityInfo",
              razorpay_payment_status:
                "$payment_detail_info.razorpay_payment_status",
              categoryName: "$categoryInfo.category_name",
            },
          },
        ])
        .exec();
      console.log(courseInfo, "courseindo");
      if (decoded.usertype_in == false) {
        var user_data = await Models.user.findOne({ _id: decoded._id }).exec();
        if (
          courseInfo[0]?.declined_user !== undefined &&
          courseInfo[0]?.declined_user !== null &&
          courseInfo[0]?.declined_user.includes(user_data?.user_id)
        ) {
          courseInfo[0].block_button = true;
        } else {
          courseInfo[0].block_button = false;
        }

        var feedback_data = await Models.feedback
          .findOne({
            user_id: data.user_id,
            course_id: data.course_id,
            feed_type: "feedback",
          })
          .exec();
        courseInfo[0].feedback_data = feedback_data;
        console.log(
          "courseInfo[0].feedback_data  ------->   ",
          courseInfo[0].feedback_data
        );
      }

      var resultInfo = {};
      if (courseInfo) {
        resultInfo = courseInfo[0];
      }
      data.response = {
        status: 200,
        message: "Course fetched successfully",
        data: resultInfo,
      };
      return data;
    }
  } catch (e) {
    console.log(e);
    data.response = {
      message: e,
      status: 0,
    };
    return data;
  }
};

const courseTimeLine = async function (data, authData) {
  try {
    userLogger.info(__filename, "search_course request ---->  ," + data);
    var decoded = Auth.decodeToken(authData);

    if (
      decoded?.usertype_in === false ||
      decoded?.is_active === false ||
      decoded?.deleted_date !== null
    ) {
      data.response = {
        status: 0,
        message: "You are not valid!!",
      };
      return data;
    }
    delete data["action"];
    delete data["command"];
    //delete data["flag"]z;
    var keyfield;
    if (data.flag == "Approved" || data.flag == "Published") {
      var record = await Models.course.aggregate([
        {
          $match: {
            course_id: data.course_id,
          },
        },
        {
          $project: {
            courseedition_id: 1,
          },
        },
      ]);
      console.log(record, "asdsojd");
      if (record[0]) {
        var id = record[0]["courseedition_id"];
      }
    } else {
      var id = data.course_id;
    }
    var record = await Models.courseLog.aggregate([
      {
        $match: {
          course_id: id,
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);
    data.response = {
      status: 200,
      message: "Course fetched successfully",
      data: record,
    };
    return data;
  } catch (e) {
    console.log(e);
  }
};

const search_course = async function (data, authData) {
  try {
    userLogger.info(__filename, "search_course request ---->  ," + data);

    var decoded = Auth.decodeToken(authData);

    if (
      decoded?.usertype_in === true ||
      decoded?.is_active === false ||
      decoded?.deleted_date !== null
    ) {
      data.response = {
        status: 0,
        message: "You are not valid!!",
      };
      return data;
    }

    var createdAt = data.createdAt;

    delete data["action"];
    delete data["command"];
    delete data["createdAt"];

    if (data.course_title !== undefined) {
      data.course_title = {
        $regex: new RegExp(data.course_title),
        $options: "i",
      };
    }

    var record = await Models.course.aggregate([
      {
        $match: data,
      },
      {
        $sort: {
          createdAt: createdAt,
        },
      },
    ]);

    if (record.length !== 0) {
      data.response = {
        status: 200,
        return: STATUS.SUCCESS,
        data: record,
        message: "Data found.",
      };
    } else {
      data.response = {
        status: 0,
        result: STATUS.ERROR,
        message: "Data not found.",
      };
    }

    userLogger.info(__filename, "search_course response ---->  ," + data);
    return data;
  } catch (error) {
    userLogger.info(__filename, "search_course catch block ---->  ," + error);

    data.response = {
      status: 0,
      result: STATUS.ERROR,
      message: "Something is wrong",
      error: error,
    };
    return data;
  }
};

const recommended_course = async function (data, authData) {
  try {
    userLogger.info(__filename, "recommended course," + data);
    var decoded = Auth.decodeToken(authData);
    if (
      decoded?.usertype_in === true ||
      decoded?.is_active === false ||
      decoded?.deleted_date !== null
    ) {
      data.response = {
        status: 0,
        message: "You are not valid!!",
      };
      return data;
    }
    var course_array = [];

    const getScore = await Models.questionResponse.aggregate([
      {
        $match: {
          user_id: data.user_id,
        },
      },
      {
        $sort: {
          avg_score: 1,
        },
      },
    ]);
    console.log(JSON.stringify(getScore, null, 4));
    if (getScore.length > 0) {
      for (var i = 0; i < getScore.length; i++) {
        let category_id = getScore[i]["category_id"];
        let score = getScore[i]["avg_score"];
        var level = "";
        if (score == 0) {
          level = "Beginner";
        } else if (score == 1) {
          level = "Intermediate";
        } else if (score > 1 && score < 5) {
          level = "Advanced";
        } else {
          level = "Advanced";
        }
        const getCourse = await Models.course.aggregate([
          {
            $match: {
              category_id: category_id,
              course_level: level,
            },
          },
          {
            $limit: 1,
          },
        ]);
        if (getCourse.length > 0) {
          course_array.push(getCourse[0]);
        }
      }
      userLogger.info(__filename, "getScore" + course_array);

      data.response = {
        status: 200,
        message: "Fetched successfully recommended course",
        data: course_array,
      };
      return data;
    } else {
      const getCourse = await Models.course.aggregate([
        {
          $sample: {
            size: 5,
          },
        },
      ]);
      if (getCourse.length > 0) {
        course_array.push(getCourse[0]);
      }
      data.response = {
        status: 200,
        message: "Fetched successfully recommended course",
        data: course_array,
      };
      return data;
    }
  } catch (e) {
    userLogger.info(__filename, "recommended course inside catch" + e);
  }
};

const recommended_courseList = async function (data, authData) {
  try {
    userLogger.info(__filename, "assignment list," + data);
    var decoded = Auth.decodeToken(authData);
    if (
      decoded?.usertype_in === true ||
      decoded?.is_active === false ||
      decoded?.deleted_date !== null
    ) {
      data.response = {
        status: 0,
        message: "You are not valid!!",
      };
      return data;
    }
    /*const result = await Models.course.aggregate([
        {
          $group: {
            _id: "$category_id",
            courses: { $push: "$$ROOT" } 
          }
        }
      ]);*/
    const result = await Models.course.aggregate([
      {
        $match: {
          category_id: data.category_id,
          deleted_date: null,
        },
      },
    ]);
    data.response = {
      status: 200,
      message: "Recommended course list fetched",
      data: result,
    };
    return data;
  } catch (e) {
    console.log(e);
    userLogger.info(__filename, "recommended course inside catch" + e);
  }
};

const getAssessmentList = async function (data, authData) {
  try {
    userLogger.info(__filename, "assignment list," + data);
    var decoded = Auth.decodeToken(authData);
    if (decoded?.is_active === false || decoded?.deleted_date !== null) {
      data.response = {
        status: 0,
        message: "You are not valid!!",
      };
      return data;
    }
    const getAssignmentList = await Models.assignment.aggregate([
      {
        $match: {
          course_id: data?.course_id,
          deleted_date: null,
        },
      },
      {
        $sort: {
          assignment_id: 1,
        },
      },
    ]);
    data.response = {
      status: 200,
      message: "Fetched successfully assignment",
      data: getAssignmentList,
    };
    return data;
  } catch (e) {
    console.log(e);
  }
};

const popularCourses = async function (data, authData) {
  try {
    userLogger.info(__filename, "module delete api start" + data);
    var decoded = Auth.decodeToken(authData);

    if (
      decoded?.usertype_in === true ||
      decoded?.is_active === false ||
      decoded?.deleted_date !== null
    ) {
      data.response = {
        status: 0,
        message: "You are not valid!!",
      };
      return data;
    }

    // let data_arr = await Models.course.find({is_deleted: false}).exec()

    // const maxObject = data_arr.reduce((max, current) => (current.value > max.value ? current : max), data_arr[0]);

    var matchData;

    var skip = data.limit * (data.page_no - 1);
    var limit = data.limit;

    if (data.type == "Latest_course") {
      console.log("               -------------->    Letest ");
      matchData = {
        is_deleted: false,
        deleted_date: null,
      };
    }

    if (data.type == "Best_course") {
      console.log("               -------------->    Best  ");
      matchData = {
        is_deleted: false,
        deleted_date: null,
        best_course: true,
      };
    }

    if (data.type == undefined || data.type == null) {
      console.log("               -------------->    Popular ");
      matchData = {
        is_deleted: false,
        deleted_date: null,
        dummy_rating: 5,
      };
    }

    var record = await Models.course.aggregate([
      {
        $match: matchData,
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ]);

    var total = await Models.course.aggregate([
      {
        $match: matchData,
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);

    var devident = total.length / limit;
    var pages;

    if (devident > parseInt(devident)) {
      pages = parseInt(devident) + 1;
    } else {
      pages = devident;
    }

    if (record.length > 0) {
      data.response = {
        status: 200,
        result: STATUS.SUCCESS,
        total_data: total.length,
        total_pages: pages,
        count: record.length,
        data: record,
        message: "Data found",
      };
    } else {
      data.response = {
        status: 0,
        result: STATUS.ERROR,
        message: "Data not found.",
      };
    }

    return data;
  } catch (e) {
    console.log(e);
  }
};

const deleteModule = async function (data, authData) {
  try {
    userLogger.info(__filename, "module delete api start," + data);
    var decoded = Auth.decodeToken(authData);
    if (
      !decoded?.usertype_in === true ||
      decoded?.is_active === false ||
      decoded?.deleted_date !== null
    ) {
      data.response = {
        status: 0,
        message: "You are not valid!!",
      };
      return data;
    }
    const filterModule = {
      _id: new ObjectId(data?._id),
    };
    data.deleted_date = new Date();
    data.deleted_by = decoded?._id;
    delete data.module_id;
    console.log(data._id);
    let updatemodule = await Models.moduleEdition
      .updateOne(filterModule, data)
      .exec();

    if (!updatemodule) {
      console.error("Error module deleteModule document:", updatemodule);
    } else {
      console.log("Document module delete successfully");
    }
    data.response = {
      status: 200,
      message: "Success",
      data: updatemodule,
    };
    return data;
  } catch (e) {
    console.log(e);
    userLogger.info(__filename, "Module delete api error" + e);
    data.response = {
      status: 0,
      message: e,
    };
    return data;
  }
};

const myLearningSave = async function (data, authData) {
  try {
    userLogger.info(__filename, "myLearning start," + data);
    var decoded = Auth.decodeToken(authData);
    if (
      decoded?.usertype_in === true ||
      decoded?.is_active === false ||
      decoded?.deleted_date !== null
    ) {
      data.response = {
        status: 0,
        message: "You are not valid!!",
      };
      return data;
    }
    if (data.completed_flag == true) {
      const addCompletedLearning = new Models.myCompletedLearning(
        data.learning
      );
      const saveCompletedLearning = await addCompletedLearning.save();
    } else {
      const addLearning = new Models.myLearning(data.learning);
      var saveLearning = await addLearning.save();
    }
    data.response = {
      status: 200,
      message: "Saved successfully",
      data: saveLearning,
    };
    return data;
  } catch (e) {
    console.log(e);
    userLogger.info(__filename, "myLearning error" + e);
    data.response = {
      status: 0,
      message: e,
    };
    return data;
  }
};

const addFavourite = async function (data, authData) {
  try {
    var decoded = Auth.decodeToken(authData);
    if (
      decoded?.usertype_in === false ||
      decoded?.is_active === false ||
      decoded?.deleted_date !== null
    ) {
      data.response = {
        status: 0,
        message: "You are not valid!!",
      };
      return data;
    }

    let res_data = await Models.course.findOneAndUpdate(
      { _id: new ObjectId(data._id) },
      { $set: data },
      { new: true }
    );

    if (res_data !== null) {
      data.response = {
        status: 200,
        result: STATUS.SUCCESS,
        data: res_data,
        message: "Added course in favourite.",
      };
    } else {
      data.response = {
        status: 0,
        result: STATUS.ERROR,
        message: "Something went wrong.",
      };
    }

    return data;
  } catch (error) {
    data.response = {
      status: 0,
      result: STATUS.ERROR,
      error: error,
      message: "Something went wrong.",
    };
    return data;
  }
};

const listFavourite = async function (data, authData) {
  try {
    var decoded = Auth.decodeToken(authData);
    if (
      decoded?.usertype_in === true ||
      decoded?.is_active === false ||
      decoded?.deleted_date !== null
    ) {
      data.response = {
        status: 0,
        message: "You are not valid!!",
      };
      return data;
    }

    var record = await Models.course.aggregate([
      {
        $match: {
          is_deleted: data.is_deleted,
          is_favourite: data.is_favourite,
        },
      },
      {
        $sort: {
          createdAt: data.createdAt,
        },
      },
      {
        $skip: data.skip,
      },
      {
        $limit: data.limit,
      },
    ]);

    if (record.length > 0) {
      data.response = {
        status: 200,
        result: STATUS.SUCCESS,
        data: record,
        message: "Data found",
      };
    } else {
      data.response = {
        status: 0,
        result: STATUS.ERROR,
        message: "Data not found.",
      };
    }

    return data;
  } catch (error) {
    data.response = {
      status: 0,
      result: STATUS.ERROR,
      error: error,
      message: "Something went wrong.",
    };
    return data;
  }
};

const remark_data = async function (data, authData) {
  try {
    var decoded = Auth.decodeToken(authData);
    if (
      decoded?.usertype_in === false ||
      decoded?.is_active === false ||
      decoded?.deleted_date !== null
    ) {
      data.response = {
        status: 0,
        message: "You are not valid!!",
      };
      return data;
    }

    delete data["action"];
    delete data["command"];
    data.action = "Rejected";

    var record = await Models.courseLog.aggregate([
      {
        $match: data,
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);

    if (record.length > 0) {
      data.response = {
        status: 200,
        result: STATUS.SUCCESS,
        data: record[0],
        message: "Data found",
      };
    } else {
      data.response = {
        status: 0,
        result: STATUS.ERROR,
        message: "Data not found.",
      };
    }

    return data;
  } catch (error) {
    data.response = {
      status: 0,
      result: STATUS.ERROR,
      error: error,
      message: "Something went wrong.",
    };
    return data;
  }
};

const createContentEdition = async function (data, authData) {
  try {
    const decoded = Auth.decodeToken(authData);

    if (
      !(
        decoded?.usertype_in === true &&
        decoded?.is_active === true &&
        decoded?.deleted_date == null
      )
    ) {
      data.response = {
        status: 0,
        message: "You are not an admin!!",
      };
      return data;
    }

    var add;
    var chapterData = data?.chapter;
    var ModuleInfo = chapterData?.module;

    if (chapterData._id == undefined || chapterData._id == "") {
      add = await new Models.chapterEdition({
        chapter_title: chapterData.chapter_title,
        course_id: chapterData.course_id, // courseEdition_id
      }).save();
    } else {
      if (
        chapterData?.is_deleted != undefined &&
        chapterData?.is_deleted == true
      ) {
        chapterData.deleted_date = new Date();
        chapterData.deleted_by = decoded?._id;
      }
      delete chapterData["is_deleted"];
      delete chapterData["module"];
      delete chapterData["course_id"];

      add = await Models.chapterEdition.findOneAndUpdate(
        { _id: new ObjectId(chapterData._id) },
        { $set: chapterData },
        { new: true }
      );
    }

    if (ModuleInfo.length > 0) {
      for (var i = 0; i < ModuleInfo.length; i++) {
        if (ModuleInfo[i]["_id"] != undefined && ModuleInfo[i]["_id"] != "") {
          let moduleUpdate = {
            module_header: ModuleInfo[i]["module_header"],
            course_id: ModuleInfo[i].course_id, // courseEdition_id
            module_description: ModuleInfo[i]["module_description"],
            module_link: ModuleInfo[i]["module_link"],
            module_pdf: ModuleInfo[i]["module_pdf"],
            chapterEdition_id: add?.chapterEdition_id,
          };
          const filterModule = {
            _id: new ObjectId(ModuleInfo[i]["_id"]),
          };
          delete ModuleInfo[i]["module_id"];
          if (
            ModuleInfo[i]["is_deleted"] != undefined &&
            ModuleInfo[i]["is_deleted"] == true
          ) {
            moduleUpdate.deleted_date = new Date();
            moduleUpdate.deleted_by = decoded?._id;
          }
          let updatemodule = await Models.moduleEdition
            .updateOne(filterModule, moduleUpdate)
            .exec();
        } else {
          delete ModuleInfo[i]["module_id"];
          delete ModuleInfo[i]["_id"];
          let module = {
            module_header: ModuleInfo[i]["module_header"],
            course_id: ModuleInfo[i].course_id, // courseEdition_id
            module_description: ModuleInfo[i]["module_description"],
            module_link: ModuleInfo[i]["module_link"],
            module_pdf: ModuleInfo[i]["module_pdf"],
            chapterEdition_id: add.chapterEdition_id,
          };
          let addModule = await new Models.moduleEdition(module).save();
        }
      }
    }

    data.response = {
      result: STATUS.SUCCESS,
      status: 200,
      data: add,
      message: "Course and Community created",
    };
    return data;
  } catch (eContent) {
    console.log("eContent           ----------->   ", eContent);
    userLogger.info(__filename, "create content error --- >>>>," + eContent);
    data.response = {
      status: 0,
      message: eContent,
    };
    return data;
  }
};

const continue_course_Add = async function (data, authData) {
  try {
    var decoded = Auth.decodeToken(authData);
    if (
      decoded?.usertype_in === true ||
      decoded?.is_active === false ||
      decoded?.deleted_date !== null
    ) {
      data.response = {
        status: 0,
        message: "You are not valid!!",
      };
      return data;
    }
    delete data["command"];
    delete data["action"];
    var record;

    if (
      data.course_id == undefined ||
      data.chapter_id == undefined ||
      data.module_id == undefined ||
      data.user_id == undefined ||
      data.end_time.length == 0 ||
      data.status.length == 0
    ) {
      data.response = {
        status: 0,
        result: STATUS.ERROR,
        message: "Some field is missing.",
      };

      return data;
    }

    console.log("data continue_course_Add  ---------------->   ", data);

    let module_data = await Models.continue_course
      .findOne({ module_id: data.module_id, user_id: data.user_id })
      .exec();

    if (module_data == null) {
      record = await new Models.continue_course(data).save();
    } else {
      if (module_data.status == "Completed") {
        data.status = "Completed";
      }
      record = await Models.continue_course.findOneAndUpdate(
        { _id: new ObjectId(module_data._id) },
        { $set: data },
        { new: true }
      );
    }
    if (record != null) {
      data.response = {
        status: 200,
        result: STATUS.SUCCESS,
        data: record,
        message: "Data found",
      };
    } else {
      data.response = {
        status: 0,
        result: STATUS.ERROR,
        message: "Data not found.",
      };
    }
    return data;
  } catch (error) {
    console.log("Error   --------> ", error);
    data.response = {
      status: 0,
      result: STATUS.ERROR,
      error: error,
      message: "Something went wrong.",
    };
    return data;
  }
};

const continue_course_list = async function (data, authData) {
  try {
    var decoded = Auth.decodeToken(authData);
    if (
      decoded?.usertype_in === true ||
      decoded?.is_active === false ||
      decoded?.deleted_date !== null
    ) {
      data.response = {
        status: 0,
        message: "You are not valid!!",
      };
      return data;
    }

    var final_data = [];
    var skip = data.limit * (data.page_no - 1);
    var limit = data.limit;
    var createdAt = data.createdAt;
    delete data["command"];
    delete data["action"];
    delete data["page_no"];
    delete data["limit"];
    delete data["createdAt"];
    if (data.status == "Continue") {
      var record = await Models.continue_course.aggregate([
        {
          $match: {
            user_id: data.user_id,
          },
        },
        {
          $group: {
            _id: "$course_id",
            continue_course_data: {
              $push: "$$ROOT",
            },
            createdAt: {
              $last: "$createdAt",
            },
          },
        },
        {
          $lookup: {
            as: "user_certificate_data",
            from: "certificates",
            let: { course_id: "$_id", user_id: data.user_id },
            pipeline: [
              {
                $match: {
                  $and: [
                    { $expr: { $eq: ["$course_id", "$$course_id"] } },
                    { $expr: { $eq: ["$user_id", "$$user_id"] } },
                  ],
                },
              },
            ],
          },
        },
        {
          $unwind: {
            path: "$user_certificate_data",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: {
            user_certificate_data: {
              $exists: false,
            },
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
        {
          $skip: skip,
        },
        {
          $limit: limit,
        },
      ]);

      var total = await Models.continue_course.aggregate([
        {
          $match: {
            user_id: data.user_id,
          },
        },
        {
          $group: {
            _id: "$course_id",
            continue_course_data: {
              $push: "$$ROOT",
            },
            createdAt: {
              $last: "$createdAt",
            },
          },
        },
        {
          $lookup: {
            as: "user_certificate_data",
            from: "certificates",
            let: { course_id: "$_id", user_id: data.user_id },
            pipeline: [
              {
                $match: {
                  $and: [
                    { $expr: { $eq: ["$course_id", "$$course_id"] } },
                    { $expr: { $eq: ["$user_id", "$$user_id"] } },
                  ],
                },
              },
            ],
          },
        },
        {
          $unwind: {
            path: "$user_certificate_data",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $match: {
            user_certificate_data: {
              $exists: false,
            },
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
      ]);

      for (var i = 0; i < record.length; i++) {
        var course_data = await Models.course
          .findOne({ course_id: record[i]._id })
          .exec();

        var module_data = await Models.module
          .find({ course_id: course_data.courseedition_id })
          .exec();
        var countinue_cou_data = await Models.continue_course
          .find({
            course_id: record[i]._id,
            status: "Completed",
            user_id: data.user_id,
          })
          .exec();

        console.log(
          "module_data.length              ------>  ",
          module_data.length
        );
        console.log(
          "countinue_cou_data.length       ------>  ",
          countinue_cou_data.length
        );

        var certificate_data = await Models.certificate
          .findOne({ course_id: record[i]._id, user_id: data.user_id })
          .exec();

        if (certificate_data == null) {
          percentage = (countinue_cou_data.length / module_data.length) * 100;

          final_data.push({
            continue_course_data: record[i].continue_course_data[0],
            percentage: percentage,
            course_data: course_data,
          });
        }
      }

      var devident = total.length / limit;
      var pages;

      if (devident > parseInt(devident)) {
        pages = parseInt(devident) + 1;
      } else {
        pages = devident;
      }

      if (final_data.length > 0) {
        data.response = {
          status: 200,
          result: STATUS.SUCCESS,
          total_data: total.length,
          total_pages: pages,
          count: final_data.length,
          data: final_data,
          message: "Data found",
        };
      } else {
        data.response = {
          status: 0,
          result: STATUS.ERROR,
          message: "Data not found.",
        };
      }
      return data;
    }
    if (data.status == "Completed") {
      let course_data = await Models.course
        .findOne({ course_id: data.course_id })
        .exec();
      let module_data = await Models.module
        .find({ course_id: course_data.courseedition_id })
        .exec();
      let certificate_data = await Models.certificate
        .findOne({ user_id: data.user_id, course_id: data.course_id })
        .exec();

      if (certificate_data != null) {
        data.response = {
          status: 200,
          result: STATUS.SUCCESS,
          data: certificate_data,
          message: "Data found",
        };

        return data;
      } else {
        record = await Models.continue_course.aggregate([
          {
            $match: data,
          },
        ]);

        delete data["status"];

        var all_record = await Models.continue_course.aggregate([
          {
            $match: data,
          },
          {
            $lookup: {
              from: "modules",
              localField: "chapter_id",
              foreignField: "chapter_id",
              as: "all_module",
            },
          },
        ]);

        // var chapter_ids = []
        // var module_ids = []
        // for (var i = 0; i < record.length; i++) {
        //   chapter_ids.push(record[i].chapter_id)
        //   module_ids.push(record[i].module_id)
        // }

        if (all_record.length > 0) {
          data.response = {
            status: 200,
            result: STATUS.SUCCESS,
            module: module_data.length,
            count: record.length,
            data: all_record,
            // chapter_ids: chapter_ids,
            // module_ids: module_ids,
            message: "Data found",
          };
        } else {
          data.response = {
            status: 0,
            result: STATUS.ERROR,
            message: "Data not found.",
          };
        }
        return data;
      }
    }
  } catch (error) {
    console.log("Error   --------> ", error);
    data.response = {
      status: 0,
      result: STATUS.ERROR,
      error: error,
      message: "Something went wrong.",
    };
    return data;
  }
};

const completed_course_list = async function (data, authData) {
  try {
    var decoded = Auth.decodeToken(authData);
    if (
      decoded?.usertype_in === true ||
      decoded?.is_active === false ||
      decoded?.deleted_date !== null
    ) {
      data.response = {
        status: 0,
        message: "You are not valid!!",
      };
      return data;
    }

    var skip = data.limit * (data.page_no - 1);
    var limit = data.limit;
    delete data["command"];
    delete data["action"];
    delete data["page_no"];
    delete data["limit"];

    var record = await Models.certificate.aggregate([
      {
        $match: data,
      },
      {
        $lookup: {
          from: "courses",
          localField: "course_id",
          foreignField: "course_id",
          as: "course_data",
        },
      },
      {
        $unwind: {
          path: "$course_data",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ]);

    var total = await Models.certificate.aggregate([
      {
        $match: data,
      },
      {
        $lookup: {
          from: "courses",
          localField: "course_id",
          foreignField: "course_id",
          as: "course_data",
        },
      },
      {
        $unwind: {
          path: "$course_data",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ]);

    var devident = total.length / limit;
    var pages;

    if (devident > parseInt(devident)) {
      pages = parseInt(devident) + 1;
    } else {
      pages = devident;
    }

    if (record.length == 0) {
      data.response = {
        status: 0,
        result: STATUS.ERROR,
        message: "Data not pressent",
      };
    } else {
      data.response = {
        status: 200,
        result: STATUS.SUCCESS,
        total_data: total.length,
        total_pages: pages,
        data: record,
        message: "Data pressent",
      };
    }
    return data;
  } catch (error) {
    console.log("Error   --------> ", error);
    data.response = {
      status: 0,
      result: STATUS.ERROR,
      error: error,
      message: "Something went wrong.",
    };
    return data;
  }
};

const content_consumtion = async function (data, authData) {
  try {
    var decoded = Auth.decodeToken(authData);
    if (
      decoded?.usertype_in === false ||
      decoded?.is_active === false ||
      decoded?.deleted_date !== null
    ) {
      data.response = {
        status: 0,
        message: "You are not valid!!",
      };
      return data;
    }

    delete data["command"];
    delete data["action"];

    if (data.user_id !== undefined && data.user_id !== null) {
      var match_data = {
        type: "Course",
        user_id: data?.user_id,
      };
    } else {
      var match_data = {
        type: "Course",
      };
    }

    var record = await Models.payment_detail.aggregate([
      {
        $match: match_data,
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $lookup: {
          from: "courses",
          localField: "course_id",
          foreignField: "course_id",
          as: "course_data",
        },
      },
      {
        $unwind: {
          path: "$course_data",
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);

    if (record.length == 0) {
      data.response = {
        status: 0,
        result: STATUS.SUCCESS,
        message: "Data not pressent",
      };
    } else {
      data.response = {
        status: 200,
        result: STATUS.SUCCESS,
        count: record.length,
        data: record,
        message: "Data found",
      };
    }
    return data;
  } catch (error) {
    console.log("Error   --------> ", error);
    data.response = {
      status: 0,
      result: STATUS.ERROR,
      error: error,
      message: "Something went wrong.",
    };
    return data;
  }
};

module.exports = {
  create,
  createContent,
  updateCourseStatus,
  addCourseAssessment,
  getCourseList,
  getChapterList,
  getModuleList,
  getCourseDetails,
  search_course,
  getAssessmentList,
  recommended_course,
  popularCourses,
  recommended_courseList,
  deleteModule,
  myLearningSave,
  addFavourite,
  listFavourite,
  remark_data,
  createContentEdition,
  continue_course_Add,
  continue_course_list,
  completed_course_list,
  courseTimeLine,
  content_consumtion,
};
