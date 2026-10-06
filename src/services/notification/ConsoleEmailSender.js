class ConsoleEmailSender {
  send(to, message) {
    console.log(`[EMAIL] ${message.replace("{to}", to)}`);
  }
}

module.exports = ConsoleEmailSender;
