<!DOCTYPE html>
<html lang="en">

  <head>
    <!-- Required meta tags -->
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />

    <!-- Bootstrap CSS -->
    <link
      href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css"
      rel="stylesheet"
      integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC"
      crossorigin="anonymous" />

    <!--  Font Family -->
    <link href="https://fonts.googleapis.com/css?family=Gloock"
      rel="stylesheet" />
    <link href="https://fonts.googleapis.com/css?family=Poppins"
      rel="stylesheet" />

    <link href='https://fonts.googleapis.com/css?family=Alex Brush'
      rel='stylesheet'>

    <title>Tajurba Certificat</title>
    <style>
      body {
   padding: 20px 0;
   background: #ccc;
   font-family: "Poppins";
}
.cursive {
   font-family: "Gloock";
}

.textYellow {
   color: #d89330;
}
.pm-certificate-container {
   height: 100%;
   width: 100%;
   position: relative;
   background-color: #fff;
   background-image: url("{{bg_logo}}");
   background-size: 100% 100%;
   background-repeat: no-repeat;
   padding: 30px;
   color: #2f302e;
}
.title-certificate {
   font-size: 60px;
   letter-spacing: 1px;
}
.pm-name-text {
   display: -webkit-inline-box;
}
.pm-name-text::before {
   content: url("{{right_logo}}");
   display: block;
   position: relative;
   left: -7px;
   top: -5px;
}
.pm-name-text::after {
   content: url("{{left_logo}}");
   display: block;
   position: relative;
   left: 5px;
   top: -5px;
}
.pm-earned-text {
   font-family: "Samarkan" !important;
}
.pm-earned-text-name {
   font-family: "Alex Brush" !important;
   font-size: 50px;
}
.name-bottom-line {
   position: absolute;
   top: 64px;
   left: 26%;
   width: 400px;
}
.border-bottom {
   border-bottom: 2px solid #d89330 !important;
   letter-spacing: 1px;
}
.logo-img {
   position: absolute;
   top: 40px;
   right: 68px;
   width: 260px;
}
.tajurba-logo-width {
   width: 200px;
}
.footer-subtitle {
   font-size: 12px;
}

    </style>
  </head>

  <body>
    <div class="container pm-certificate-container">
      <div class="row mt-5 position-relative">
        <div class="col-1">

        </div>
        <div class="col-9">
          <div class="cursive col-xs-12 text-center mt-4">
            <h1 class="title-certificate">CERTIFICATE</h1>

          </div>

          <div class="row">
            <div class="col-xs-12">
              <div class="row text-center">
                <div
                  class="pm-certificate-name underline margin-0 text-center my-3">
                  <h5 class="pm-name-text bold textYellow"><span class="mt-1">OF
                      ACHIEVEMENT</span></h5>
                </div>

                <span class="pm-credits-text mb-3">This
                  Certificate
                  Is Proudly Presented To</span>

              </div>
            </div>

            <div class="col-xs-12">
              <div class="row">
                <div class="pm-course-title text-center">
                  <div
                    class="h1 pm-earned-text padding-0 block mb-3">
                    <img src="{{tajurba_name}}"
                      class="img-fluid tajurba-logo-width" />
                  </div>
                  <div class="position-relative">
                    <div class="pm-earned-text-name block ">${user_name}</div>
                    <!-- <br /> -->
                    <img src="{{bottomline_img}}"
                      class="img-fluid name-bottom-line" />
                  </div>
                  <div class="pm-credits-text block bold sans mt-2">For
                    Successfully
                    completing</div>
                </div>
                <div class="pm-course-title underline text-center">

                </div>
                <div class="text-center mt-3">
                  <h3 class="mb-3">${course_name}</h3>
                </div>
                <div class="pm-course-title underline text-center mb-5">
                  <span class="pm-credits-text block bold sans">From ${start_date}
                    To ${end_date}</span>
                </div>
                <div class="pm-course-title underline text-center">
                  <div class="d-flex justify-content-center align-items-center">
                    <div>
                      <h5 class="cursive mb-0 border-bottom pb-2">Suresh
                        Mansharamani</h5>
                      <small class="textYellow">Business Coach & OKR
                        Expert</small>
                    </div>
                    <div class="px-3">
                      <img src="{{dot_img}}" class="mt-1" />
                    </div>
                    <div>
                      <h5 class="cursive mb-0 border-bottom  pb-2">Uma
                        Mansharamani</h5>
                      <small class="textYellow">Business Coach & OKR
                        Expert</small>
                    </div>
                  </div>
                </div>
                <div class="pm-course-title underline text-center my-5">
                  <small class="footer-title">Co-founders Tajurba Business Pvt.
                    Ltd</small>
                  <br />
                  <small
                    class="footer-subtitle">www.sureshmansharamani.com</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <img src="{{logo_img}}" class="img-fluid logo-img" />

      </div>

      <!-- Optional JavaScript; choose one of the two! -->

      <!-- Option 1: Bootstrap Bundle with Popper -->
      <script
        src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM"
        crossorigin="anonymous"></script>

      <!-- Option 2: Separate Popper and Bootstrap JS -->
      <!--
    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.2/dist/umd/popper.min.js" integrity="sha384-IQsoLXl5PILFhosVNubq5LC7Qb9DXgDA9i+tQ8Zj3iwWAwPtgFTxbJ8NT4GN1R8p" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.min.js" integrity="sha384-cVKIPhGWiC2Al4u+LWgxfKTRIcfu0JTxR+EQDz/bgldoEyl4H0zUF0QKbrJ0EcQF" crossorigin="anonymous"></script>
    -->
    </body>

  </html>