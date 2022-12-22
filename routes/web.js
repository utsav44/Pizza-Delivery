
const homeController=require("../app/http/controllers/homeController");
const authController=require("../app/http/controllers/authController");
const cartController=require("../app/http/controllers/customers/cartController");
const orderController =require("../app/http/controllers/customers/orderController");
const adminOrderController =require("../app/http/controllers/admin/orderController");
const statusController =require("../app/http/controllers/admin/statusController");
const passwordController=require("../app/http/controllers/passwordController");
//middlewares


const guest = require("../app/http/middleware/guest");
const auth = require("../app/http/middleware/auth");
const admin =require("../app/http/middleware/admin");




function initRoutes(app) {

  app.get("/", homeController().index);

  app.get("/getotp",guest,authController().getOtp);
  app.post("/generateOTP",guest,authController().generateOTP);
  app.post("/validateOTP",guest,authController().validateOTP);

  app.get("/updatePassGetOTP",guest,passwordController().updatePassGetOTP);
  app.post("/updatePassGenerateOTP",guest,passwordController().updatePassGenerateOTP);
  app.post("/updatePassValidateOTP",guest,passwordController().updatePassValidateOTP);
  app.post("/setNewPass",guest,passwordController().setNewPass);
  
  app.get("/login",guest, authController().login);
  app.post("/userlogin", authController().postUserLogin);
  app.post("/adminlogin", authController().postAdminLogin);

  app.post("/userregister",authController().postuserRegister);
  app.post("/adminregister",authController().postadminRegister);
  
  app.post("/logout",authController().logout);

  app.get("/cart",cartController().index );

  app.post("/updateCart",cartController().update);

  app.post("/orders",auth,orderController().store);

  app.get("/customer/orders",auth,orderController().index);
  
  app.get("/customer/order/:id",auth,orderController().show);
  
  //Admin routes
  app.get("/admin/orders",admin,adminOrderController().index);

  app.post("/admin/order/status",admin,statusController().update);
  
}

module.exports=initRoutes
