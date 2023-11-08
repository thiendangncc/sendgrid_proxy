const express = require('express')
const app = express()
const port = 4000
const sendgridKey = "";
const client = require('@sendgrid/client');
client.setApiKey(sendgridKey);
app.use(express.json())    // <==== parse request body as JSON
const Handlebars = require("handlebars");
const nodemailer = require('nodemailer');

app.get('/', (req, res) => {
  res.send('Hello World!')
})

// create transporter object with smtp server details
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
        user: 'xxxxx',
        pass: 'xxxxx'
    }
});


const parseTemplate = (template, data) => {
    let html = template.versions[0].html_content;
    const dataVariable = data.dynamic_template_data;
    const subject = dataVariable?.subject || "";
    const to = data.to.email;
    const bcc = data?.bcc?.email;
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
    const from = req.body.from;
    const [html, subject, to, bcc] = parseTemplate(template, req.body.personalizations[0])
    console.log(`start send: ${subject} to ${to} and bcc (${bcc})`);
    // send email
    transporter.sendMail({
        from,
        to,
        subject,
        html
    });

    res.send('Done')
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
    transporter.sendMail({
        from: from.email,
        to,
        subject,
        text
    });

    res.send('Done')
})
  
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})