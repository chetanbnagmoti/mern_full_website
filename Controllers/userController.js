const users=require("../Models/userSchema");
const moment=require("moment");
const csv =require("csv");
const fs=require("fs");
const BASE_URL=process.env.BASE_URL;

//regitore user:-
exports.userpost=async(req,res)=>{
       // console.log(req.file);
       // console.log(req.body);
       const file=req.file.filename;
       const {fname,lname,email,mobile,location,status,gender}=req.body;

       if(!fname || !lname || !email || !mobile || !location || !status || !gender || !file){
              res.status(401).json("All Inputes Are Required");
       }

       try {
            const peruser=await users.findOne({email:email});
            
            if(peruser){
              res.status(401).json("This User Alredy Exit ");
            }else{

              const datecreated=moment(new Date()).format("YYYY-MM-DD  hh:mm:ss");

              const userData=new users({
                     fname,lname,email,mobile,location,status,gender,profile:file,datecreated
              });

              await userData.save();
              res.status(200).json(userData);
            }
       } catch (error) {
              res.status(401).json(error);
              console.log(error);
       }
}

//users get:-
exports.userget =async(req,res)=>{

       console.log(req.query);

       const search =req.query.search || "" ;
       const gender =req.query.gender || "" ;
       const status=req.query.status || "" ;
       const sort=req.query.sort || "";
       const page =req.query.page || 1;
       const Item_Per_Page=2;


       const query={
              fname :{$regex:search,$options:"i"}
       };
       
       if(gender !=="All"){
              query.gender=gender;
       }
       
       if(status !== "All"){
              query.status=status;
       }

     try {
       
       const skip=(page-1)*Item_Per_Page     //1*4=4
       
       const count =await users.countDocuments(query);
       console.log(count);

       const userData=await users.find(query)
       .sort({datecreated:sort=="New" ?  -1 : 1})
       .limit(Item_Per_Page)
       .skip(skip);

       const pageCount=Math.ceil(count/Item_Per_Page);         //8/4=2

       res.status(200).json({
         Pagination: {
           count,
           pageCount,
         },
         userData,
       });
     } catch (error) {
       res.status(401).json(error);
     }
}

//single User get:-
exports.singleuserget =async(req,res)=>{

       const {id}=req.params;

       try {
              const userdata=await users.findOne({_id:id});
              res.status(200).json(userdata);
       } catch (error) {
              res.status(401).json(error);
       }
}

//useredit:-
exports.useredit=async(req,res)=>{
       const {id}=req.params;
       const {fname,lname,email,mobile,location,status,gender,user_profile}=req.body;
       const file=req.file? req.file.filename:user_profile

       const dateupdated=moment(new Date()).format("YYYY-MM-DD  hh:mm:ss");

       try {
             
              const updateuser=await users.findByIdAndUpdate({_id:id},{
                 fname,lname,email,mobile,location,status,gender,profile:file,dateupdated
              },{
                     new:true
              });

              await updateuser.save();
              res.status(200).json(updateuser);

       } catch (error) {
              res.status(401).json(error); 
       }

}

//userDelete:-
exports.userdelete=async(req,res)=>{
       const {id}=req.params;
       try {
            const deleteuser=await users.findByIdAndDelete({_id:id});
            res.status(200).json(deleteuser); 
       } catch (error) {
              res.status(401).json(error); 
       }
}

// changes userstatus :-

exports.userstatus =async(req,res)=>{
     
       const {id} =req.params;
       const {data} =req.body;

       try {

         const userstatusupdate=await users.findByIdAndUpdate({_id:id},{status:data},{new:true});
         res.status(200).json(userstatusupdate);
              
       } catch (error) {
           res.status(401).json(error); 
       }
}

//user Export :- 
exports.userExport=async (req,res)=>{
        try {
              const userData=await users.find();

              const csvStream=csv.format({headers:true});

              if(!fs.existsSync("public/files/export")){
                     if(!fs.existsSync("public/files")){
                          fs.mkdirSync("public/files/");
                     }

                     if(!fs.existsSync("public/files/export")){
                            fs.mkdirSync("./public/files/export");
                     }
              }
              
              const writablestream=fs.createWriteStream(
                     "public/files/export/users.csv"
              )

              csvStream.pipe(writablestream);

              writablestream.on("finish",function(){
                     res.json({
                           downloadUrl:`${BASE_URL}/files/export/users.csv`
                     })
              });

              if(userData.length>0){
                     userData.map((user)=>{
                            csvStream.write({
                                   FirstName:user.fname ? user.fname: "-",
                                   LastName:user.lname ?user.lname:"-",
                                   Email:user.email ? user.email:"-",
                                   Phone: user.mobile ? user.mobile :"-",
                                   Gender:user.gender ?user.gender:"-",
                                   Status:user.status?user.status:"-",
                                   Profile:user.profile?user.profile:"-",
                                   Location:user.location ?user.location:"-",
                                   Datecreated:user.datecreated ?user.datecreated:"-",
                                   Dateupdated:user.dateupdated? user.dateupdated:"-",
                            })
                     })
              }

              csvStream.end();
              writablestream.end();

        } catch (error) {
              res.status(401).json(error); 
        } 
}