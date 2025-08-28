// src/utils/emailTemplate.js

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
                  color: #1F2937;
                  margin: 0;
                  padding: 0;
                  background-color: #FFFFFF;
              }
              .container {
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                  background-color: #F3F4F6;
                  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              }
              .header {
                  background: linear-gradient(to bottom, #51617a, #627288);
                  padding: 20px;
                  text-align: center;
                  border-radius: 8px 8px 0 0;
              }
              .content {
                  padding: 20px;
                  background-color: #FFFFFF;
                  border-radius: 4px;
                  margin: 20px 0;
              }
              .footer {
                  background: linear-gradient(to top, #51617a, #627288);
                  padding: 20px;
                  text-align: center;
                  border-radius: 0 0 8px 8px;
                  color: #FFFFFF;
              }
              h1, h2, h3, h4, h5, h6 {
                  font-family: 'Outfit', Arial, sans-serif;
              }
              h1 {
                  color: #FFFFFF;
                  font-size: 24px;
                  margin: 0;
              }
              h2 {
                  color: #1F2937;
                  font-size: 20px;
              }
              .button {
                  display: inline-block;
                  padding: 10px 20px;
                  background-color: #3B82F6;
                  color: #FFFFFF !important;
                  text-decoration: none;
                  border-radius: 5px;
                  font-weight: bold;
                  transition: background-color 0.3s ease;
              }
              .button:hover {
                  background-color: #60A5FA;
              }
              .card {
                  background-color: #F3F4F6;
                  border: 1px solid #E5E7EB;
                  border-radius: 5px;
                  padding: 15px;
                  margin-bottom: 15px;
              }
              .card-title {
                  font-weight: bold;
                  color: #1F2937;
              }
              a {
                  color: #3B82F6;
                  text-decoration: none;
              }
              .footer a {
                  color: #FFFFFF;
                  text-decoration: underline;
              }
              @media (max-width: 600px) {
                  .container {
                      width: 100%;
                      padding: 10px;
                  }
                  .content {
                      padding: 15px;
                  }
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
