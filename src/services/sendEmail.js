import nodemailer from 'nodemailer';
export const sendEmail=async(to,subject,html,attachments=[])=>{
    const transporter = nodemailer.createTransport({
        service:"gmail",
        auth: {
          user: process.env.senderEmail,
          pass: process.env.myPassword,
        },

});



const info = await transporter.sendMail({
    from: `"Developer Nada " <${process.env.senderEmail}>`, 
    to: to ?to :"nadaehab1401@gmail.com", 
    subject: subject ? subject : "Hello ✔",
    html:html ? html : "<b>Hello world?</b>",
    attachments
  });
  if(info.accepted){
    return true;

  }
  return false;


console.log(info);

}

export default sendEmail;

