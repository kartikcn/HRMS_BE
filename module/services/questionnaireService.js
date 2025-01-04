const getQuestionnaire = async function (data) {
    if((data.category).length > 0) {
        var matchQuery = {
            "category_id": { $in: data.category }
        };
    } else {
        var matchQuery = {};
    }
    const BooklistData = await Models.questionnaire.aggregate([
        { $match: matchQuery },
        { $sort: { sequenceNumber: 1 } }
    ]);
    console.log(BooklistData)
    var resp = {
        status: 200,
        result: BooklistData
    }
    data.response =  resp['result'];
    console.log(data.response+'----->>>');
    return data;
}

const saveQuesResponse = async (data) => {
    try {

        if (data.attempt == 4) {

            var record = await Models.questionResponse.deleteMany({user_id: data.user_id, attempt: 1}).exec()

            let up_data1 = await Models.questionResponse.updateMany(
              { user_id: data.user_id, attempt: 2 },
              { $set: {
                        attempt: 1
                      }
              },
              { new: true });

            let up_data2 = await Models.questionResponse.updateMany(
              { user_id: data.user_id, attempt: 3 },
              { $set: {
                        attempt: 2
                      }
              },
              { new: true });

            data.attempt = 3
        }

        var { user_id, attempt, questionScore } = data;
        var respInfo = data.questionScore.map(score => ({
            user_id,
            attempt,
            ...score
        }));
        var insertInfo = await Models.questionResponse.insertMany( respInfo );
        data.response = {
            status: 200,
            result: 'success',
            data: insertInfo,
            message: "user response data stored.",
        }
  
        userLogger.info(__filename, 'Note create process response ---->  ,' + data);
  
        return data;
    } catch(e) {
        console.log(e)
    }
}

const graph_data = async (data) => {
    try {

        // const decoded = Auth.decodeToken(authData);

        // if (decoded?.usertype_in == true || decoded?.is_active == false || decoded?.deleted_date !== null) {
        //   data.response = {
        //       status: 0,
        //       message: "You are not valid user!"
        //   }
        //   return data;
        // }

        delete data["action"]
        delete data["command"]

        var record = await Models.questionResponse.aggregate([
          {
            '$match': data
          }, {
            '$lookup': {
              'from': 'categories', 
              'localField': 'category_id', 
              'foreignField': 'category_id', 
              'as': 'category_data'
            }
          }, {
            '$unwind': {
              'path': '$category_data', 
              'preserveNullAndEmptyArrays': true
            }
          }, {
            '$project': {
              'avg_score': 1, 
              'attempt': 1, 
              'user_id': 1, 
              'category_id': 1, 
              'createdAt': 1,
              'category_name': '$category_data.category_name'
            }
          }, {
            '$group': {
              '_id':  '$$ROOT.attempt', 
              'data': {
                '$push': '$$ROOT'
              }
            }
          }, {
            '$sort': {
              '_id': 1
            }
          }
        ]);

        if (record.length !== 0) {
            data.response = {
                status: 200,
                result: STATUS.SUCCESS,
                data: record,
                message: "Data found.",
            }
        }else{
            data.response = {
                status: 0,
                result: STATUS.ERROR,
                message: "Data not found.",
            }
        }
        return data;
    } catch(error) {
        data.response = {
            status: 0,
            result: STATUS.ERROR,
            error: error,
            message: "Data not found.",
        }

        return data;
    }
}

module.exports = {
    saveQuesResponse,
    getQuestionnaire,
    graph_data
}