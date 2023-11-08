const express = require('express')
const app = express()
const port = 4000
const sendgridKey = "";
const client = require('@sendgrid/client');
client.setApiKey(sendgridKey);
app.use(express.json({limit: '500mb'}))    // <==== parse request body as JSON
const Handlebars = require("handlebars");
const nodemailer = require('nodemailer');

app.get('/', (req, res) => {
  res.send('Hello World!')
})

// create transporter object with smtp server details
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    auth:  {
        user: 'xxxx',
        pass: 'xxxx'
    }
});
const mailQueue = [];
setInterval(() => {// send queue
    if (mailQueue.length === 0) return;
    const item = mailQueue.pop();
    console.log(`start send: ${item.subject} to ${item.to}`);
    transporter.sendMail(item);
}, 500);


const parseTemplate = (template, data) => {
    let html = template.versions[0].html_content;
    const dataVariable = data.dynamic_template_data;
    // const subject = Handlebars.compile(template.versions[0].subject)(dataVariable);
    // const to = data.to.email;
    const subject = Handlebars.compile(template.versions[0].subject)(dataVariable);
    const to = data.to.map(t => t.email).join(',');
    const bcc = data?.bcc ? data?.bcc?.map(t => t.email).join(',') : '';

    // const bcc = data?.bcc?.email;
    const templateBuilder = Handlebars.compile(html)
    // parse
    // for (let keyObject in dataVariable) {
    //     html = html.replace(new RegExp(`{{${keyObject}}}`, 'g'), dataVariable[keyObject]);
    // }
    html = templateBuilder(dataVariable);
    // final template
    return [html, subject, to, bcc]
}
app.post('/send', async (req, res) => {
    //get send grid key
    console.log(`---- input ${JSON.stringify(req.body)}`);
    const key = req.body?.key;
    if (key) {
        client.setApiKey(key);
    }
    const [response, template] = await 
      client.request({
        url: `/v3/templates/${req.body.templateId}`,
        method: 'GET',
      })
    const attachments = req.body?.attachments || [];
    const from = `${req.body.from.name} <${req.body.from.email}>`;
    const [html, subject, to, bcc] = parseTemplate(template, req.body.personalizations[0])
    console.log(`push to queue: ${subject} to ${to} and bcc (${bcc})`);
    // send email
    mailQueue.push({
        from,
        to,
        bcc,
        attachments,
        subject,
        html
    });
    // transporter.sendMail({
    //     from,
    //     to,
    //     subject,
    //     html
    // });

    res.send({status: 'Done'})
})
  
app.post('/send-raw', async (req, res) => {
    //get send grid key
    console.log(`---- input ${JSON.stringify(req.body)}`);
    const key = req.body?.key;
    if (key) {
        client.setApiKey(key);
    }
    const {subject, to, text, from} = req.body;
    console.log(`start send raw: ${subject} to ${to}`);
    // send email
    
    mailQueue.push({
        from: from.email,
        to,
        subject,
        text
    });
    // transporter.sendMail({
    //     from: from.email,
    //     to,
    //     subject,
    //     text
    // });

    res.send({status: 'Done'})
})
  
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})