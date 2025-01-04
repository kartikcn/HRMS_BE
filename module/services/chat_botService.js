const { OpenAI } = require("openai");
const openai = new OpenAI({
  apiKey: 'sk-proj-mQ2er741aSIb5NOU5jaNT3BlbkFJxA1dAyPplFlEH3A3sJss'
});

const create = async (data, authData) => {
  try {

    const decoded = Auth.decodeToken(authData);
    if (decoded ?. usertype_in === true || decoded ?. is_active === false || decoded ?. deleted_date !== null) {
        data.response = {
            status: 0,
            message: "You are not valid user!!"
        }
        return data;
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-16k",
      messages: data.input,
    });
    console.log(" myAssistant   ------------->   ", response.choices[0].message.content)

    var saved_data = await new Models.chat_gpt({
      user_id: data.user_id,
      question: data.question,
      gpt_answer: response.choices[0].message.content,
    }).save();

    if (saved_data !== null) {
      data.response = {
        status: 200,
        result: STATUS.SUCCESS,
        data: saved_data,
        message: "Data found."
      }
    }else{
      data.response = {
        status: 0,
        result: STATUS.ERROR,
        message: "Data found."
      }
    }
    return data;
  } catch (error) {
      console.log("error    --------------->   ", error)
      data.response = {
          status: 0,
          result: STATUS.ERROR,
          message: "Something is wrong",
          error: error
      }
      return data;
  }
}

const apple_data_add = async (data, authData) => {
  try {

    var message = ""
    var res_data = {}
    let apple_data = await Models.apple_record.findOne({ apple_id: data.apple_id}).exec();

    if (apple_data == null) {
      res_data = await new Models.apple_record(data).save();
      message = "Data stored successfully."
    }else{
      res_data = apple_data
      message = "Data found."
    }

    if (res_data._id == undefined) {
      data.response = {
        status: 0,
        result: STATUS.ERROR,
        message: "Data not found."
      }
    }else{
      data.response = {
        status: 200,
        result: STATUS.SUCCESS,
        data: res_data,
        message: message
      }
    }
    return data;
  } catch (error) {
      console.log("error    --------------->   ", error)
      data.response = {
          status: 0,
          result: STATUS.ERROR,
          message: "Something is wrong",
          error: error
      }
      return data;
  }
}

module.exports = {
    create,
    apple_data_add,
};
