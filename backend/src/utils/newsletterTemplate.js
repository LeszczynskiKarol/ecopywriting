// backend/src/utils/newsletterTemplate.js

function generateNewsletterEmail(data) {
    return `
      <!DOCTYPE html>
      <html lang="pl">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Newsletter eCopywriting.pl</title>
          <style>
             body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f4f4f7;
          }
          .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #ffffff;
          }
          .header {
              background: linear-gradient(to bottom, #e6e6ff, #ffffff);
              padding: 20px;
              text-align: center;
              border-radius: 8px 8px 0 0;
          }
          .content {
              padding: 20px;
          }
          .footer {
              background: linear-gradient(to top, #e6e6ff, #ffffff);
              padding: 20px;
              text-align: center;
              border-radius: 0 0 8px 8px;
          }
          h1 {
              color: #3b3b8f;
              font-size: 24px;
          }
          h2 {
              color: #4b4ba3;
              font-size: 20px;
          }
          .button {
              display: inline-block;
              padding: 10px 20px;
              background-color: #4b4ba3;
              color: #ffffff;
              text-decoration: none;
              border-radius: 5px;
              font-weight: bold;
          }
          .service-card {
              background-color: #f9f9ff;
              border: 1px solid #e0e0e0;
              border-radius: 5px;
              padding: 15px;
              margin-bottom: 15px;
          }
          .service-title {
              font-weight: bold;
              color: #3b3b8f;
          }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>eCopywriting.pl Newsletter</h1>
              </div>
              <div class="content">
                  <h2>Witaj, ${data.name},</h2>
                  <p>Mamy nadzieję, że ten newsletter znajdzie Cię w dobrym nastroju. Oto najnowsze informacje i porady z świata copywritingu:</p>
                  
                  <div class="service-card">
                      <p class="service-title">${data.serviceTitle}</p>
                      <p>${data.serviceDescription}</p>
                  </div>
                  
                  <p>${data.content}</p>
                  
                  <p>Chcesz dowiedzieć się więcej?</p>
                  <p style="text-align: center;">
                      <a href="${data.ctaLink}" class="button">Sprawdź nasze usługi</a>
                  </p>
              </div>
              <div class="footer">
                  <p>© 2024 eCopywriting.pl. Wszelkie prawa zastrzeżone.</p>
                  <p>
                      <a href="${process.env.FRONTEND_URL}/newsletter-management">Zarządzaj subskrypcją</a> |                      
                  </p>
              </div>
          </div>
      </body>
      </html>
    `;
  }
  
  module.exports = { generateNewsletterEmail };