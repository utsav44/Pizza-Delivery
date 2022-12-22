const client = require("twilio")(process.env.ACCOUNTSID,process.env.AUTHTOKEN);

function getOTP(req,res,numberForOTP)
{
    client
              .verify
              .services(process.env.SERVICEID)
              .verifications
              .create({
                to:`+91${numberForOTP}`,
                channel:'sms'
              })
              .then(function(data)
              {
                console.log(data);
                if(data.status==="pending")
                {
                    res.render("auth/insertOTP",{number:numberForOTP,role:role,error:""});
                }
                else{
                  req.flash("error", "Something went wrong");
                  return res.redirect("/getOtp");
                }
              })
};

module.exports=getOTP;