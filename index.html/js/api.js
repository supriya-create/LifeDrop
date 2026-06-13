const api = {
  post: async (path, data, isFormData = false) => {
    const token = localStorage.getItem('lifedropToken');
    const options = { method: 'POST', headers: {} };
    if (token) {
      options.headers.Authorization = `Bearer ${token}`;
    }
    if (!isFormData) {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(data);
    } else {
      options.body = data;
    }

    const response = await fetch(path, options);
    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || 'Server error');
    }
    return json;
  },
  get: async (path) => {
    const token = localStorage.getItem('lifedropToken');
    const options = { headers: {} };
    if (token) {
      options.headers.Authorization = `Bearer ${token}`;
    }
    const response = await fetch(path, options);
    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || 'Server error');
    }
    return json;
  },
};

const showMessage = (message) => {
  alert(message);
};

const handleContactSubmit = async (event) => {
  event.preventDefault();
  const form = event.target;
  try {
    const body = {
      name: form.querySelector('#contactName').value.trim(),
      email: form.querySelector('#contactEmail').value.trim(),
      subject: form.querySelector('#contactSubject').value,
      message: form.querySelector('#contactMessage').value.trim(),
    };

    await api.post('/api/contact', body);
    showMessage('Thank you! Your message has been sent successfully.');
    form.reset();
  } catch (error) {
    showMessage(error.message);
  }
};

const handleNewsletterSubmit = async (event) => {
  event.preventDefault();
  const email = document.querySelector('#newsletterEmail').value.trim();
  if (!email) {
    return showMessage('Please enter a valid email address.');
  }

  try {
    await api.post('/api/newsletter', { email });
    showMessage('Subscribed successfully. You will receive updates soon!');
    event.target.reset();
  } catch (error) {
    showMessage(error.message);
  }
};

const handleEnquirySubmit = async (event) => {
  event.preventDefault();
  const form = event.target;
  const data = new FormData();
  data.append('name', form.querySelector('#name').value.trim());
  data.append('email', form.querySelector('#email').value.trim());
  data.append('phone', form.querySelector('#phone').value.trim());
  data.append('userType', form.querySelector('#userType').value);
  data.append('subject', form.querySelector('#subject').value.trim());
  data.append('message', form.querySelector('#message').value.trim());
  const file = form.querySelector('#file').files[0];
  if (file) data.append('file', file);

  try {
    await api.post('/api/enquiries', data, true);
    showMessage('Your enquiry has been submitted. We will contact you soon.');
    form.reset();
  } catch (error) {
    showMessage(error.message);
  }
};

const handleHospitalSubmit = async (event) => {
  event.preventDefault();
  const form = event.target;
  try {
    const body = {
      name: form.querySelector('#hospitalName').value.trim(),
      location: form.querySelector('#hospitalLocation').value.trim(),
      email: form.querySelector('#hospitalEmail').value.trim(),
    };
    await api.post('/api/hospitals', body);
    showMessage('Hospital registered successfully.');
    form.reset();
    loadDashboardData();
  } catch (error) {
    showMessage(error.message);
  }
};

const handleDoctorRequestSubmit = async (event) => {
  event.preventDefault();
  const form = event.target;
  try {
    const body = {
      doctorName: form.querySelector('#doctorName').value.trim(),
      hospital: form.querySelector('#doctorHospital').value.trim(),
      bloodGroup: form.querySelector('#doctorBloodGroup').value,
      unitsRequired: Number(form.querySelector('#doctorUnits').value),
    };
    await api.post('/api/requests', body);
    showMessage('Your blood request has been submitted.');
    form.reset();
    loadDashboardData();
  } catch (error) {
    showMessage(error.message);
  }
};

const loadDashboardData = async () => {
  const inventoryBody = document.querySelector('#inventoryTableBody');
  const hospitalGrid = document.querySelector('#hospitalGrid');
  const requestBody = document.querySelector('#requestsTableBody');

  if (inventoryBody) {
    try {
      const inventory = await api.get('/api/inventory');
      inventoryBody.innerHTML = inventory.map(item => `
        <tr>
          <td>${item.bloodGroup}</td>
          <td>${item.unitsAvailable}</td>
          <td>${item.unitsAvailable <= item.criticalThreshold ? 'Yes' : 'No'}</td>
        </tr>
      `).join('');
    } catch (error) {
      inventoryBody.innerHTML = '<tr><td colspan="3">Unable to load inventory data.</td></tr>';
    }
  }

  if (hospitalGrid) {
    try {
      const hospitals = await api.get('/api/hospitals');
      hospitalGrid.innerHTML = hospitals.map(hospital => `
        <div class="card">
          <h3>${hospital.name}</h3>
          <p>Location: ${hospital.location}</p>
          <p>Email: ${hospital.email}</p>
        </div>
      `).join('');
    } catch (error) {
      hospitalGrid.innerHTML = '<p>Unable to load hospital data.</p>';
    }
  }

  if (requestBody) {
    try {
      const requests = await api.get('/api/requests');
      requestBody.innerHTML = requests.map(request => `
        <tr>
          <td>${request.doctorName}</td>
          <td>${request.hospital}</td>
          <td>${request.bloodGroup}</td>
          <td>${request.unitsRequired}</td>
          <td>${request.status}</td>
        </tr>
      `).join('');
    } catch (error) {
      requestBody.innerHTML = '<tr><td colspan="5">Unable to load request data.</td></tr>';
    }
  }
};

const handleLoginSubmit = async (event) => {
  event.preventDefault();
  const form = event.target;
  try {
    const body = {
      email: form.querySelector('#loginEmail').value.trim(),
      password: form.querySelector('#loginPassword').value,
    };
    const result = await api.post('/api/auth/login', body);
    localStorage.setItem('lifedropToken', result.token);
    showMessage('Login successful. You can now use protected admin actions.');
    form.reset();
  } catch (error) {
    showMessage(error.message);
  }
};

const initFormHandlers = () => {
  const contactForm = document.querySelector('#contactForm');
  if (contactForm) contactForm.addEventListener('submit', handleContactSubmit);

  const newsletterForm = document.querySelector('#newsletterForm');
  if (newsletterForm) newsletterForm.addEventListener('submit', handleNewsletterSubmit);

  const enquiryForm = document.querySelector('#enquiryForm');
  if (enquiryForm) enquiryForm.addEventListener('submit', handleEnquirySubmit);

  const hospitalForm = document.querySelector('#hospitalForm');
  if (hospitalForm) hospitalForm.addEventListener('submit', handleHospitalSubmit);

  const doctorForm = document.querySelector('#doctorRequestForm');
  if (doctorForm) doctorForm.addEventListener('submit', handleDoctorRequestSubmit);

  const loginForm = document.querySelector('#loginForm');
  if (loginForm) loginForm.addEventListener('submit', handleLoginSubmit);

  if (document.querySelector('#inventoryTableBody')) {
    loadDashboardData();
  }
};

window.addEventListener('DOMContentLoaded', initFormHandlers);
