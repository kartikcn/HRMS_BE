const fs = require("fs");
const tpl = require('node-tpl');
const mail = require('../../system/mailer/mail');
const prjConfig = require("../../config.json");
const path = require('path');
const file_upload = require("../services/commonFunctions")
const handlebars = require('handlebars');
const puppeteer = require('puppeteer');
const numberToWords = require('number-to-words');

const create = async (data) => {
  try {

    var userInfo = await Models.user.findOne({user_id: data.user_id}).exec();

    var gst_amount = data.paid_amount*0.18
    var total_amount = data.paid_amount + gst_amount
    var words = numberToWords.toWords(total_amount);
    var todays_date = new Date()
    var invoice_data = await new Models.invoice({
      user_id: data.user_id,
      course_id: data.course_id
    }).save()

    const paddedNumber = String(invoice_data.invoice_id).padStart(4, '0');
    var next_year = parseInt(todays_date.toLocaleString().split(",")[0].split("/")[2].split("0")[1]) + 1

    var invoice_no = "TBN-" + paddedNumber + "-" + todays_date.toLocaleString().split(",")[0].split("/")[2] + "_" + next_year

    var tplContent = tpl.fetch(__dirname+"/../../system/template/invoice.tpl", "utf-8");

    const date = new Date(todays_date);

    const getOrdinalSuffix = (day) => ['th', 'st', 'nd', 'rd'][(day % 10 > 3) ? 0 : ((day % 100 - day % 10 != 10) ? 1 : 0) * day % 10];

    const formattedDate = `${date.getDate()}${getOrdinalSuffix(date.getDate())} ${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;

    if(data.type == "Course"){
      console.log("   invoice Course")
      var courseInfo = await Models.course.findOne({course_id: data.course_id}).exec();
      tplContent = tplContent.replace("${sc_name}", courseInfo.course_title);
      var mail_html = "Course payment invoice"
    }

    if (data.type == "Subscription") {
      console.log("   invoice Subscription")
      var subscInfo = await Models.subscription.findOne({_id: data.subscription_id}).exec();
      tplContent = tplContent.replace("${sc_name}", subscInfo.name);
      var mail_html = "Subscription payment invoice"
    }

    tplContent = tplContent.replace("${invoice_no}", invoice_no);
    tplContent = tplContent.replace("${today_date}", formattedDate);
    tplContent = tplContent.replace("${paid_amount}", data.paid_amount);
    tplContent = tplContent.replace("${paid_amount_1}", data.paid_amount);
    tplContent = tplContent.replace("${gst_amount}", gst_amount);
    tplContent = tplContent.replace("${total_amount}", total_amount);
    tplContent = tplContent.replace("${amount_word}", words);
    tplContent = tplContent.replace("{{image_url}}", prjConfig.Image_url.invoice_img);
    const template = handlebars.compile(tplContent);
    const renderedHtml = template();
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent(renderedHtml, {
      waitUntil: 'networkidle0' // Ensure all external resources like images are loaded
    });
    await page.setContent(renderedHtml);
    await page.setContent(renderedHtml, {
      waitUntil: 'networkidle0' // Ensure all external resources like images are loaded
    });
    
    let pdf_data = await page.pdf({ path: 'output12.pdf', format: 'A4', printBackground: true });

    var record = {
      body: {
        docType: "invoice"
      },
      files: {
        file: {
          name: userInfo.first_name + "_payment.pdf",
          data: pdf_data,
          mimetype: "application/pdf"
        }
      }
    }

    var url = await file_upload.file_upload(record)   // s3 function call
    console.log("url    ----------------->   ", url)

    let up_payment_data = await Models.payment_detail.findOneAndUpdate(
            { _id: new ObjectId(data._id) },
            { $set: {
                      invoice_no: invoice_no,
                      invoice_file: url.response.data.Location
                    }
            },
            { new: true });

    let up_invoice_data = await Models.invoice.findOneAndUpdate(
            { _id: new ObjectId(invoice_data._id) },
            { $set: {
                      invoice_no: invoice_no,
                      invoice_file: url.response.data.Location
                    }
            },
            { new: true });

    const mailObj = new mail();

    const mailResponse = await mailObj.sendMail({
        from: `${prjConfig.MAIL.SENDER_NAME} <${prjConfig.MAIL.SENDER_EMAIL}>`,
        to: userInfo.email,
        subject: `Payment invoice`,
        html: mail_html,
        attachments: [
        {
            filename: userInfo.first_name + "_payment.pdf",
            path: url.response.data.Location
        }]
    });

    data.response = {
        status: 0,
        result: STATUS.SUCCESS,
        message: "Mail sent to user.",
        data: url.response.data.Location
    }
    return data;

  } catch (error) {
    console.log("error  invoice ------------>  ", error)
      data.response = {
          status: 0,
          result: STATUS.ERROR,
          message: "Something is wrong",
          error: error
      }
      return data;
  }
}

const certificate = async (data) => {
  try {

    var userInfo = await Models.user.findOne({user_id: data.user_id}).exec();

    delete data["command"]
    delete data["action"]

    var cont_courseInfo = await Models.continue_course.find(data).exec();
    var cont_courseInfo_rev = await Models.continue_course.find(data).sort({createdAt: -1}).exec();
    var userInfo = await Models.user.findOne({user_id: data.user_id}).exec();
    var course_data = await Models.course.findOne({course_id: data.course_id}).exec();

    var start_date = new Date(cont_courseInfo[0].createdAt)
    var end_date = new Date(cont_courseInfo_rev[0].createdAt)

    start_date = await date(start_date)

    end_date  = await date(end_date)

    console.log("start_date   ------------>  ", start_date)
    console.log("end_date   ------------>  ", end_date)
 
    var tplContent = tpl.fetch(__dirname+"/../../system/template/certificate.tpl", "utf-8");

    tplContent = tplContent.replace("${user_name}", userInfo.first_name);
    tplContent = tplContent.replace("${start_date}", start_date);
    tplContent = tplContent.replace("${end_date}", end_date);
    tplContent = tplContent.replace("${course_name}", course_data.course_title);
    tplContent = tplContent.replace("{{logo_img}}", prjConfig.Image_url.logo_img);
    tplContent = tplContent.replace("{{bottomline_img}}", prjConfig.Image_url.bottomline_img);
    tplContent = tplContent.replace("{{dot_img}}", prjConfig.Image_url.dot_img);
    tplContent = tplContent.replace("{{tajurba_name}}", prjConfig.Image_url.tajurba_name);
    tplContent = tplContent.replace("{{right_logo}}", prjConfig.Image_url.right_logo);
    tplContent = tplContent.replace("{{left_logo}}", prjConfig.Image_url.left_logo);
    tplContent = tplContent.replace("{{bg_logo}}", prjConfig.Image_url.bg_logo);

    const template = handlebars.compile(tplContent);
    const renderedHtml = template();
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent(renderedHtml, {
      waitUntil: 'networkidle0' // Ensure all external resources like images are loaded
    });

    await page.setViewport({
        width: 1200,
        height: 900,
        deviceScaleFactor: 1,
    });

    await page.setContent(renderedHtml);

    let pdf_data = await page.pdf({ path: 'output12.pdf', format: 'A2', printBackground: true });

    let image_data = await page.screenshot({ path: 'output.png' });

    var record = {
      body: {
        docType: "certificate"
      },
      files: {
        file: {
          name: userInfo.first_name + "_certificate.pdf",
          data: pdf_data,
          mimetype: "application/pdf"
        }
      }
    }

    var img_record = {
      body: {
        docType: "certificate"
      },
      files: {
        file: {
          name: userInfo.first_name + "_image.png",
          data: image_data,
          mimetype: "image/png"
        }
      }
    }

    var url = await file_upload.file_upload(record)   // s3 function call

    var img_url = await file_upload.file_upload(img_record)   // s3 function call

    let saved_data = await Models.certificate({
      user_id: data.user_id,
      course_id: data.course_id,
      certificate: url.response.data.Location,
      img_certificate: img_url.response.data.Location,
    }).save();

    const mailObj = new mail();

    const mailResponse = await mailObj.sendMail({
        from: `${prjConfig.MAIL.SENDER_NAME} <${prjConfig.MAIL.SENDER_EMAIL}>`,
        to: userInfo.email,
        subject: `Certificate`,
        html: "Tajurba course certificate",
        attachments: [
        {
            filename: userInfo.first_name + "_certificate.pdf",
            path: url.response.data.Location
        }]
    });

    var badge_data = await file_upload.badge_allocation({
        user_id: userInfo.user_id
    })

    data.response = {
        status: 0,
        result: STATUS.SUCCESS,
        message: "Mail sent to user.",
        data: saved_data
    }
    return data;

  } catch (error) {
    console.log("error  invoice ------------>  ", error)
      data.response = {
          status: 0,
          result: STATUS.ERROR,
          message: "Something is wrong",
          error: error
      }
      return data;
  }
}

const event_invoice_create = async (data) => {
  try {
    var userInfo = await Models.user.findOne({user_id: data.user_id}).exec();

    var gst_amount = data.paid_amount*0.18
    var total_amount = data.paid_amount + gst_amount
    var words = numberToWords.toWords(total_amount);
    var todays_date = new Date()
    var invoice_data = await new Models.invoice({
      user_id: data.user_id,
      event_id: data.event_id
    }).save()

    const paddedNumber = String(invoice_data.invoice_id).padStart(4, '0');
    var next_year = parseInt(todays_date.toLocaleString().split(",")[0].split("/")[2].split("0")[1]) + 1

    var invoice_no = "TBN-" + paddedNumber + "-" + todays_date.toLocaleString().split(",")[0].split("/")[2] + "_" + next_year

    var tplContent = tpl.fetch(__dirname+"/../../system/template/event_invoice.tpl", "utf-8");

    const date = new Date(todays_date);

    const getOrdinalSuffix = (day) => ['th', 'st', 'nd', 'rd'][(day % 10 > 3) ? 0 : ((day % 100 - day % 10 != 10) ? 1 : 0) * day % 10];

    const formattedDate = `${date.getDate()}${getOrdinalSuffix(date.getDate())} ${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;

    var eventInfo = await Models.event.findOne({event_id: data.event_id}).exec();

    if (eventInfo.type == "Online") {
      var event_addr = eventInfo.join_link
    }else{
      var event_addr = eventInfo.address
    }

    var start_date = new Date(eventInfo.start_date);
    var start_formattedDate = `${start_date.getDate()}${getOrdinalSuffix(start_date.getDate())} ${start_date.toLocaleString('default', { month: 'long' })} ${start_date.getFullYear()} ${start_date.toLocaleTimeString()}`;

    tplContent = tplContent.replace("${event_addr}", event_addr);
    tplContent = tplContent.replace("${event_name}", eventInfo.name);
    tplContent = tplContent.replace("${event_date}", start_formattedDate);
    tplContent = tplContent.replace("${invoice_no}", invoice_no);
    tplContent = tplContent.replace("${today_date}", formattedDate);
    tplContent = tplContent.replace("${paid_amount}", data.paid_amount);
    tplContent = tplContent.replace("${paid_amount_1}", data.paid_amount);
    tplContent = tplContent.replace("${gst_amount}", gst_amount);
    tplContent = tplContent.replace("${total_amount}", total_amount);
    tplContent = tplContent.replace("${amount_word}", words);
    tplContent = tplContent.replace("{{image_url}}", prjConfig.Image_url.invoice_img);
    const template = handlebars.compile(tplContent);
    const renderedHtml = template();
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent(renderedHtml, {
      waitUntil: 'networkidle0' // Ensure all external resources like images are loaded
    });
    await page.setContent(renderedHtml);
    await page.setContent(renderedHtml, {
      waitUntil: 'networkidle0' // Ensure all external resources like images are loaded
    });
    
    let pdf_data = await page.pdf({ path: 'output12.pdf', format: 'A4', printBackground: true });

    var record = {
      body: {
        docType: "invoice"
      },
      files: {
        file: {
          name: userInfo.first_name + "_payment.pdf",
          data: pdf_data,
          mimetype: "application/pdf"
        }
      }
    }

    var url = await file_upload.file_upload(record)   // s3 function call
    console.log("url    ----------------->   ", url)

    let up_payment_data = await Models.payment_detail.findOneAndUpdate(
            { _id: new ObjectId(data._id) },
            { $set: {
                      invoice_no: invoice_no,
                      invoice_file: url.response.data.Location
                    }
            },
            { new: true });

    let up_invoice_data = await Models.invoice.findOneAndUpdate(
            { _id: new ObjectId(invoice_data._id) },
            { $set: {
                      invoice_no: invoice_no,
                      invoice_file: url.response.data.Location
                    }
            },
            { new: true });

    const mailObj = new mail();
    const mailResponse = await mailObj.sendMail({
        from: `${prjConfig.MAIL.SENDER_NAME} <${prjConfig.MAIL.SENDER_EMAIL}>`,
        to: userInfo.email,
        subject: `Payment invoice`,
        html: "Event payment invoice",
        attachments: [
        {
            filename: userInfo.first_name + "_payment.pdf",
            path: url.response.data.Location
        }]
    });

    data.response = {
        status: 0,
        result: STATUS.SUCCESS,
        message: "Mail sent to user.",
        data: url.response.data.Location
    }
    return data;

  } catch (error) {
    console.log("error  invoice ------------>  ", error)
      data.response = {
          status: 0,
          result: STATUS.ERROR,
          message: "Something is wrong",
          error: error
      }
      return data;
  }
}

function date(date) {

  console.log("data   ----------->  ", date)

    const getOrdinalSuffix = (day) => ['th', 'st', 'nd', 'rd'][(day % 10 > 3) ? 0 : ((day % 100 - day % 10 != 10) ? 1 : 0) * day % 10];

    const formattedDate = `${date.getDate()}${getOrdinalSuffix(date.getDate())} ${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;

    return formattedDate;
}


module.exports = {
    create,
    certificate,
    event_invoice_create,
};
