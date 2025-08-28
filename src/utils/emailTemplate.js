// backend/src/utils/emailTemplate.js

function generateEmailTemplate(data) {
    return `
      <!DOCTYPE html>
      <html lang="pl">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${data.title}</title>
          <style>
              body {
                  font-family: 'Sora', Arial, sans-serif;
                  line-height: 1.6;
                  color: #e1e7ef;
                  margin: 0;
                  padding: 0;
                  background-color: #0f172a;
              }
              .container {
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                  background-color: #1e293b;
              }
              .header {
                  background: linear-gradient(to bottom, #334155, #1e293b);
                  padding: 20px;
                  text-align: center;
                  border-radius: 8px 8px 0 0;
              }
              .content {
                  padding: 20px;
              }
              .footer {
                  background: linear-gradient(to top, #334155, #1e293b);
                  padding: 20px;
                  text-align: center;
                  border-radius: 0 0 8px 8px;
              }
              h1, h2, h3, h4, h5, h6 {
                  font-family: 'Outfit', Arial, sans-serif;
              }
              h1 {
                  color: #e2e8f0;
                  font-size: 24px;
              }
              h2 {
                  color: #cbd5e1;
                  font-size: 20px;
              }
              .button {
                  display: inline-block;
                  padding: 10px 20px;
                  background-color: #3b82f6;
                  color: #ffffff !important;
                  text-decoration: none;
                  border-radius: 5px;
                  font-weight: bold;
              }
              .card {
                  background-color: #2d3748;
                  border: 1px solid #4a5568;
                  border-radius: 5px;
                  padding: 15px;
                  margin-bottom: 15px;
              }
              .card-title {
                  font-weight: bold;
                  color: #e2e8f0;
              }
              a {
                  color: #60a5fa;
                  text-decoration: none;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>${data.headerTitle}</h1>
              </div>
              <div class="content">
                  ${data.content}
              </div>
              <div class="footer">
                  <p>© ${new Date().getFullYear()} eCopywriting.pl. Wszelkie prawa zastrzeżone.</p>
                  <p>
                      <a href="${process.env.FRONTEND_URL}">Odwiedź naszą stronę</a>
                  </p>
              </div>
          </div>
      </body>
      </html>
    `;
  }
  
  module.exports = { generateEmailTemplate };