const { Sequelize, DataTypes } = require('sequelize')
const sequelize = new Sequelize('sqlite::memory:', {
    logging: false
});
const Mails = sequelize.define('Mails', {
    from: DataTypes.STRING,
    to: DataTypes.STRING,
    sentAt: DataTypes.DATE,
    bcc: DataTypes.STRING,
    attachments: DataTypes.JSON,
    subject: DataTypes.STRING,
    html: DataTypes.STRING,
    text: DataTypes.STRING,
});
sequelize.sync({
    force: true,
})

module.exports = {
    Mails
}