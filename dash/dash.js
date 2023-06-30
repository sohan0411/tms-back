//27/6/23
const db = require('../db');

// Update company details function
const updateCompany = (req, res) => {
  const data = [
    req.body.CompanyName,
    req.body.CompanyEmail,
    req.body.ContactNo,
    req.body.Location,
    req.body.Designation,
    req.params.id
  ];
  
  db.query("UPDATE tms_users SET CompanyName=?, CompanyEmail=?, ContactNo=?, Location=?, Designation=? WHERE id=?",data,(err, result) => {
      if (err) {
        res.status(500).json({ error: 'Failed to update company details.' });
      } else {
        res.status(200).json({ message: 'Company details updated successfully.' });
      }
    }
  );
};

module.exports = {
  updateCompany
};


//28/6/23

//const db = require('../db');

// Fetch and update company details function
function manageCompanyDetails (req, res){
  const UserId = req.params.UserId;
  const { CompanyName, CompanyEmail, ContactNo, Location, Designation } = req.body;

  if (req.method === 'GET') {
    // Fetch company details
    db.query("SELECT * FROM tms_users WHERE id = ?", [companyId], (err, result) => {
      if (err) {
        res.status(500).json({ error: 'Failed to fetch company details.' });
      } else {
        if (result.length === 0) {
          res.status(404).json({ error: 'User not found.' });
        } else {
          const company = result[0];
          res.status(200).json({ company });
        }
      }
    });
  } else if (req.method === 'PUT') {
    // Update company details
    const data = [CompanyName, CompanyEmail, ContactNo, Location, Designation, companyId];
    db.query(
      "UPDATE tms_users SET CompanyName=?, CompanyEmail=?, ContactNo=?, Location=?, Designation=? WHERE id=?",
      data,
      (err, result) => {
        if (err) {
          res.status(500).json({ error: 'Failed to update company details.' });
        } else {
          res.status(200).json({ message: 'Company details updated successfully.' });
        }
      }
    );
  } else {
    res.status(400).json({ error: 'Invalid request.' });
  }
};
