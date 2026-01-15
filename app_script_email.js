// Working version 0
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

// Version 1 - working - image inside html body
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var subject = data.subject;
    var htmlBody = data.htmlBody;
    var subscribers = data.subscribers || data.recipients; // support both
    var cc = data.cc || "";
    var images = data.images || [];

    // Append image URLs to htmlBody (inline)
    if (images.length > 0) {
      var imagesHtml = images.map(function(url) {
        return '<div><img src="' + url + '" style="max-width:100%;margin:8px 0;" /></div>';
      }).join('');
      htmlBody += imagesHtml;
    }

    var sent = 0;
    subscribers.forEach(function(sub) {
      MailApp.sendEmail({
        to: sub.email,
        subject: subject,
        htmlBody: htmlBody,
        name: "TFN Connect",
        cc: cc
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

// version 3 - logging
function doPost(e) {
  var logs = [];
  function log(msg) {
    logs.push(msg);
    Logger.log(msg);
  }
  try {
    log('doPost triggered');
    var data = JSON.parse(e.postData.contents);
    var subject = data.subject;
    var htmlBody = data.htmlBody;
    var subscribers = data.subscribers || data.recipients;
    var cc = data.cc || "";
    var images = data.images || [];

    // Fetch images as blobs for attachments
    var attachments = [];
    if (images.length > 0) {
      images.forEach(function(url) {
        try {
          var response = UrlFetchApp.fetch(url);
          var blob = response.getBlob();
          log('Fetched image: ' + url);
          log('Blob type: ' + blob.getContentType());
          log('Blob size: ' + blob.getBytes().length);
          attachments.push(blob);
        } catch (imgErr) {
          log('Failed to fetch image: ' + url);
        }
      });
    } else {
      log('Images length 0');
    }

    var sent = 0;
    subscribers.forEach(function(sub) {
      MailApp.sendEmail({
        to: sub.email,
        subject: subject,
        htmlBody: htmlBody,
        name: "TFN Connect",
        cc: cc,
        attachments: attachments
      });
      sent++;
    });

    return ContentService.createTextOutput(
      JSON.stringify({ success: true, count: sent, logs: logs })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    log('Error: ' + err.message);
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: err.message, logs: logs })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}