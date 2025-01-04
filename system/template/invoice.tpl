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

        <link href="./style/style.css" rel="stylesheet" />

        <!-- font family -->

        <link href="https://fonts.googleapis.com/css?family=Poppins"
            rel="stylesheet" />
        <style>
         * {
            margin: 0;
            padding: 0;
            font-family: "Poppins";
         }
         .header {
            background-color: #2c2f3a;
            padding: 3rem 0rem;
            margin-top: 3rem;
         }
         .text__grey {
            color: #c0c0c0;
         }
         .text__black {
            color: #2c2f3a;
         }
         p {
            margin-bottom: 0;
         }
      </style>
        <title>Stackmentalist</title>
    </head>
    <body>
        <section class="header">
            <div class="container">
                <div class="row">
                    <div class="col-6">
                        <img src="{{image_url}}" class="img-fluid" />
                    </div>
                    <div class="col-6">
                        <div class="header__text text-end">
                            <div class="text-white">Regd oce: 1304 Basement, DLF
                                City</div>
                            <div class="text-white">Phase-4,Gurgaon-122002</div>
                            <div>
                                <a href="#" class="text-decoration-none">
                                    suresh.mansharamani@gmail.com</a>
                            </div>
                            <div class="text-white">+91 9811933111</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <section>
            <div class="container">
                <div class="row py-5">
                    <div class="col-6">
                        <p class="text__grey">Invoice no. <span
                                class="text__black">${invoice_no}</span></p>
                    </div>
                    <div class="col-6 text-end">
                        <p class="text__grey">Date: <span
                                class="text__black">${today_date}</span></p>
                    </div>
                </div>
                <div class="row">
                    <div class="col-12 text-center">
                        <h1 class="text__grey fw-bold">TAX INVOICE</h1>
                    </div>
                </div>
                <div class="row pt-4">
                    <div class="col-6">
                        <h5 class="text__grey"
                            style="border-bottom: 4px solid #c0c0c0; width: fit-content">Particulars</h5>
                    </div>
                    <div class="col-6 d-flex justify-content-end">
                        <h5 class="text__grey"
                            style="border-bottom: 4px solid #c0c0c0; width: fit-content">Amount</h5>
                    </div>
                </div>
                <div class="row pt-4 align-items-center">
                    <div class="col-6">
                        <p class="text__black">${sc_name}</p>
                        <!-- <p class="text__black">(3 days Program -Online over
                            zoom)</p> -->
                    </div>
                    <div class="col-6 text-end">
                        <p class="text__black">${paid_amount}</p>
                    </div>
                </div>
                <div class="row pt-4">
                    <div class="col-6">
                        <p class="text__black">IGST 18% on Rs. ${paid_amount_1}/-</p>
                    </div>
                    <div class="col-6 text-end">
                        <p class="text__black">${gst_amount}</p>
                    </div>
                </div>
                <div class="row pt-4">
                    <div class="col-6">
                        <p class="text__black">Rounded off</p>
                    </div>
                    <div class="col-6 text-end">
                        <p class="text__black">Rs. 0.18</p>
                    </div>
                </div>
                <hr />
                <div class="row pt-4">
                    <div class="col-12 text-end">
                        <p class="text__black">${total_amount}</p>
                    </div>
                </div>
                <div class="row pt-4">
                    <div class="col-12">
                        <p class="text__grey">
                            Amount In words: <span class="text__black">: Rs.
                                ${amount_word}
                                only</span>
                        </p>
                    </div>
                </div>
                <div class="row pt-5">
                    <div class="col-12 text-end mt-5">
                        <p class="text__black">For Stackmentalist Business Network Pvt
                            Ltd</p>
                    </div>
                </div>
                <div class="row pt-5 mb-5">
                    <div class="col-12 text-end">
                        <p class="text__black mt-5">(Authorised Signatory)</p>
                    </div>
                </div>
            </div>
        </section>

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
