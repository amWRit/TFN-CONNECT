// Working version 1
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var subject = data.subject;
    var htmlBody = data.htmlBody;
    var subscribers = data.subscribers; // Array of { email, name }

    var sent = 0;
    subscribers.forEach(function(sub) {
      MailApp.sendEmail({
        to: sub.email,
        subject: subject,
        htmlBody: htmlBody,
        name: "TFN Connect"
      });
      sent++;
    });

    return ContentService.createTextOutput(
      JSON.stringify({ success: true, count: sent })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: err.message })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}