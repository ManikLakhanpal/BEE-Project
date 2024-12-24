const http = require('http');
const fs = require('fs');
const path = require('path');

// Helper function to serve static files
function serveFile(res, filePath, contentType) {
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('File not found');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
}

// Create the server
const server = http.createServer((req, res) => {
  if (req.method === 'GET') {
    // Serve Front-End files
    if (req.url === '/' || req.url === '/Form.html') {
      serveFile(res, path.join(__dirname, '../Front-End/Form.html'), 'text/html');
    } else if (req.url === '/Student_Details.html') {
      serveFile(res, path.join(__dirname, '../Front-End/Student_Details.html'), 'text/html');
    } else if (req.url.endsWith('.css')) {
      serveFile(res, path.join(__dirname, '../Front-End', req.url), 'text/css');
    } else if (req.url === '/students') {
      // Serve User.json data
      fs.readFile(path.join(__dirname, './User.json'), (err, data) => {
        if (err) {
          res.writeHead(500);
          res.end('Internal Server Error');
        } else {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(data);
        }
      });
    } else {
      res.writeHead(404);
      res.end('Not Found');
    }
  } else if (req.method === 'POST' && req.url === '/submit-form') {
    // Handle form submission
    let body = '';
    req.on('data', chunk => (body += chunk.toString()));
    req.on('end', () => {
      const params = new URLSearchParams(body);
      const firstName = params.get('firstName');
      const lastName = params.get('lastName');
      const email = params.get('email');
      const phone = params.get('phone');
      const gender = params.get('gender');

      // Read existing users
      fs.readFile(path.join(__dirname, './User.json'), (err, data) => {
        const users = err ? [] : JSON.parse(data);

        // Add the new user
        users.push({ firstName, lastName, email, phone, gender });

        // Save back to the file
        fs.writeFile(path.join(__dirname, './User.json'), JSON.stringify(users, null, 2), err => {
          if (err) {
            res.writeHead(500);
            res.end('Internal Server Error');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(
              'Registration successful! <a href="/Student_Details.html">View all students</a>'
            );
          }
        });
      });
    });
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
